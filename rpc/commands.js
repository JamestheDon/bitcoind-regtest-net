import { spawn, exec } from "child_process";
 
export const start = (db, node, key) => {
// Spawn x amount of nodes
  const bitcoind =  spawn(
        "bitcoind",
        [
          "-daemon",
          "-conf=" + db + "/node" + key + "/bitcoin.conf"
        ],
        { encoding: "utf-8", stdio: "pipe" }
      );
      bitcoind.stderr.on("data", (data) => {
        console.log("[bitcoind] ", data.toString());
      });
    
      bitcoind.stdout.on("data", (data) => {
          console.log(`node ready:`,data.toString());
        if (data) {
          node.running = true;
        }
      });
    
      bitcoind.on("close", (data) => {
        if (data === 1) {
          console.log("[bitcoind] ");
          node.running = true;
        }
       console.log('bitcoind starting data', data)
       // console.log(`[bitcoind] ${node.name} spawned...`);
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
              `${name}wallet`
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
             console.log('Close data', data)
            
          //  console.log("wallets:", node.wallets);
          
        });
    })
}

export const loadWallet = async (db, node) => {
    return new Promise((resolve, reject) => {
        const wallet = {
            name: `${node.name}wallet`,
            node: node.name,
            warning: "",
            loaded: false,
          };
          const start = spawn(
            "bitcoin-cli",
            [
              "-regtest",
              `-rpcport=${node.ports.rpc}`,
              "-datadir=" + db +  "/node" + node.key,
              "loadwallet",
              `${node.name}wallet`,
            ],
            { encoding: "utf-8", stdio: "pipe" }
          );
          start.stderr.on("data", (data) => {
              wallet.warning = data.toString()
          //  console.log('wallet warnings:',wallet.warning);
             // reject("rejected")
          });

          start.stdout.on("data", (data) => {
            if (data) {
              wallet.loaded = true
            //  node.wallets.push(wallet);
              console.log("[wallet] loaded.");
              resolve([node, 'wallet active'])
            }
          });

          start.on("close", (data) => {
              if (data === 18) {
                  console.log('wallet does not exist')
                  resolve('new wallet!')
              }
            if (data === 35 || node.wallets <= 0) {
              wallet.loaded = true
            //  node.wallets.push(wallet);
              console.log("[wallet] already exists:", true);
              resolve([node, 'wallet active'])
            } 
            if (data === 1) {
                console.log('[bitcoind] Error. Not running.')
            }
        //   console.log('exit code:',data)
          console.log("Closing data", data);
          });
    })
}
export const getWalletInfo = async (db, node) => {
    return new Promise((resolve, reject) => {
        // const wallet = {
        //     name: "testwallet",
        //     node: node.name,
        //     warning: "",
        //     loaded: false,
        //   };
          const start = spawn(
            "bitcoin-cli",
            [
              "-regtest",
              `-rpcport=${node.ports.rpc}`,
              "-datadir=" + db +  "/node" + node.key,
              `-rpcwallet=${node.name}wallet`,
              "getwalletinfo"
              
            ],
            { encoding: "utf-8", stdio: "pipe" }
          );
          start.stderr.on("data", (data) => {
             
           console.log('[walletInfoError]',data.toString());
           
          });

          start.stdout.on("data", (data) => {
            if (data) {
              console.log("[walletinfo] success:", data.toString());
              node.wallets.push(data.toString())
              resolve(node)
            }
          });

          start.on("close", (data) => {
            
         console.log('[walletInfo]', data)
        //   console.log('exit code:',data)
         //   console.log(" close. nodes:");
          });
    })
}

