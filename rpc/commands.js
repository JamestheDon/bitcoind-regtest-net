import { spawn, exec } from "child_process";
 
export const start = (db, node, key) => {
    console
  const bitcoind =  spawn(
        "bitcoind",
        [
          "-daemon",
          "-conf=" + db + "/node" + key + "/bitcoin.conf",
        ],
        { encoding: "utf-8", stdio: "pipe" }
      );
      bitcoind.stderr.on("data", (data) => {
        console.log("[bitcoind]", data.toString());
      });
    
      bitcoind.stdout.on("data", (data) => {
        //  console.log(`node ready:${nodesReady[i].key}`,data.toString());
        if (data) {
          node.running = true;
        }
      });
    
      bitcoind.on("close", (data) => {
        if (data === 1) {
          console.log("[bitcoind] Running", true);
          node.running = true;
        }
       
        console.log("node started:", node.running);
    });
} 

