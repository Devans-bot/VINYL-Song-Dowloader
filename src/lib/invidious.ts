export async function getHealthyInstances(): Promise<string[]> {
  try {
    const res = await fetch("https://api.invidious.io/instances.json?sort_by=type,users", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!res.ok) throw new Error("Failed to fetch instances");
    const data = await res.json();
    
    // Filter for https, api supported, and cors enabled
    const validInstances = data
      .filter((item: any) => {
        const instance = item[1];
        return instance.type === "https" && instance.api === true;
      })
      .map((item: any) => item[1].uri);
      
    if (validInstances.length === 0) {
      throw new Error("No valid Invidious instances found");
    }
    return validInstances;
  } catch (err) {
    console.error("Invidious instances fetch error:", err);
    // Fallback instances if api.invidious.io is down
    return [
      "https://inv.tux.pizza",
      "https://invidious.jing.rocks",
      "https://invidious.nerdvpn.de",
      "https://invidious.perennialte.ch"
    ];
  }
}

export async function getAudioStreamUrl(videoId: string): Promise<string> {
  const instances = await getHealthyInstances();
  
  let lastError: unknown;
  
  // Try the top 3 instances
  for (const instance of instances.slice(0, 3)) {
    try {
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        // timeout after 5 seconds to move to next instance quickly
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error(`Instance ${instance} returned ${res.status}`);
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(`Instance error: ${data.error}`);
      }
      
      const formats = data.adaptiveFormats || data.formatStreams || [];
      const audioFormat = formats.find((f: any) => 
        f.type && (f.type.includes("audio/mp4") || f.type.includes("audio/m4a"))
      );
      
      if (audioFormat && audioFormat.url) {
        return audioFormat.url;
      }
      
      throw new Error(`No m4a audio format found on ${instance}`);
    } catch (err) {
      console.error(`Failed to fetch from ${instance}:`, err);
      lastError = err;
      continue; // Try next instance
    }
  }
  
  if (lastError && lastError instanceof Error && lastError.name === "AbortError") {
    throw new Error("Download servers timed out. Try again.");
  }
  
  throw new Error("Failed to find audio stream from public servers. Try another video.");
}
