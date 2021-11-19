import { spawn, exec } from "child_process";
 
export const start = (db, node, key) => {

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

export const createWallet = async (db, node) => {
    return new Promise((resolve, reject) => {
        const {wallets, name, key} = node
        const wallet = {
            name: "testwallet",
            node: name,
            warning: "",
            loaded: false,
          };
        const start =  spawn(
            "bitcoin-cli",
            [
              "-regtest",
              `-rpcport=${node.ports.rpc}`,
              "-datadir=" + db + "/node" + key,
              "createwallet",
              "testwallet",
            ],
            { encoding: "utf-8", stdio: "pipe" }
          );
          start.stderr.on("data", (data) => {
            console.log("errror:", data.toString());
          });
    
          start.stdout.on("data", (data) => {
            //  console.log(`node ready:${nodesReady[i].key}`,data.toString());
            if (data) {
              //   nodesReady[i].wallet = "testwallet";
              wallet.loaded = true
              wallets.push(wallet)
              resolve(wallets)
            }
          });
    
          start.on("close", (data) => {
              if (data === 4) {
                console.log("Database exists", true);
                wallet.loaded = true
                wallets.push(wallet)
               resolve(node)
              }
             
          //  console.log("wallets:", node.wallets);
          
        });
    })
        
       
       
   
        
}

