// utils/serverPing.js
import axios from "axios";

class ServerPinger {
  constructor(baseURL = "http://localhost:5001") {
    this.baseURL = baseURL;
    this.intervalId = null;
  }

  ping = async () => {
    try {
      const response = await axios.get(`${this.baseURL}/api/products`);
      console.log(`✅ Server pinged at ${new Date().toLocaleTimeString()}`);
      return true;
    } catch (error) {
      console.error(`❌ Server ping failed: ${error.message}`);
      return false;
    }
  };

  start(intervalMinutes = 10) {
    // Ping immediately
    this.ping();

    // Set up recurring pings
    this.intervalId = setInterval(this.ping, intervalMinutes * 60 * 1000);

    console.log(`🔄 Server pinger started (every ${intervalMinutes} minutes)`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log("🛑 Server pinger stopped");
    }
  }
}

// Create and export singleton instance
const serverPinger = new ServerPinger();
export default serverPinger;
