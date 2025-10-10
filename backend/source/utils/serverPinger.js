import axios from "axios";

class ServerPinger {
  constructor(baseURLs = [process.env.LOCALSERVER, process.env.SERVER_URI]) {
    this.baseURLs = baseURLs;
    this.intervalId = null;
    this.currentURL = null;
  }

  ping = async () => {
    let success = false;

    // Try each URL until one works
    for (const baseURL of this.baseURLs) {
      try {
        const response = await axios.get(`${baseURL}/api/products`, {
          timeout: 10000, // 10 second timeout
        });

        if (!this.currentURL || this.currentURL !== baseURL) {
          this.currentURL = baseURL;
        }

        console.log(
          `✅ Server pinged successfully at ${new Date().toLocaleTimeString()}`
        );
        success = true;
        break; // Exit loop if successful
      } catch (error) {
        console.log(`❌ Failed to ping ${baseURL}: ${error.message}`);
        // Continue to next URL
      }
    }

    if (!success) {
      console.error("🚨 All server URLs are unreachable");
    }

    return success;
  };

  start(intervalMinutes = 10) {
    console.log(`Starting server pinger...`);

    // Ping immediately
    this.ping();

    // Set up recurring pings
    this.intervalId = setInterval(this.ping, intervalMinutes * 60 * 1000);

    console.log(`Server pinger started (every ${intervalMinutes} minutes)`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Server pinger stopped");
    }
  }

  // Get the currently active URL
  getActiveURL() {
    return this.currentURL;
  }

  // Add a new URL to monitor
  addURL(url) {
    if (!this.baseURLs.includes(url)) {
      this.baseURLs.push(url);
      console.log(`Added URL to monitor: ${url}`);
    }
  }
}

// Create and export singleton instance
const serverPinger = new ServerPinger();
export default serverPinger;
