import { stat, writeFile, mkdir } from "fs";
import { homedir, platform } from "os";
import { spawn, exec } from "child_process";

/**
 *
 * @SPEC create multipule instances of a regtest node.
 *
 *
 */

// todo: Promot in a cli for user options. auth
// ttl on node dirs. how to set?
// delete old nodes, how to keep clean/manage nodes?
const nodes = 3; // How many node to be created.
const pkgName = "ledgerd"; // Directory to build network in.
const ip = "127.0.0.1:";
const linux = "/.bitcoin/";
const windows = "UsersYourUserNameAppdataRoamingBitcoin"; // (Vista and 7)
const mac = "/Library/Application Support/Bitcoin/";
const env = platform();
const home = homedir();
const paths = [];
const ports = [];
const startPort = [8333]; // startPort 8333 is where the port generation starts from.

// Add os check to determine where data directories should be created.
const init = (env, home) => {
  if (env === "linux") {
    console.log(env);
    const url = home + linux;
    return url;
  }

  if (env === "darwin") {
    console.log(env);
    const url = home + mac;
    return url;
  }
};

// Determine database location
const db = init(env, home);

for (let i = nodes; i--; ) {
  // Generate paths
  const url = db + pkgName + "/node" + i + "/";
  paths.push(url);
  // Sequential port generation.
  const port = startPort[0]++; // 8333++
  ports.push({ port: port + nodes, rpc: port });
}

for (let i = paths.length; i--; ) {
  // Generate directories
  stat(paths[i], (err, stats) => {
    if (err) console.log(`Directory doesn't exist, making now...`);
    if (stats) {
      console.log("Directories ready:", true);
    } else {
      mkdir(paths[i], { recursive: true }, (err) => {
        if (err) {
          console.log("errrrr", err);
        }
      });
      console.log("created dir:", paths[i]);
    }
  });
}

if (ports.length && paths.length > 0) {
  console.log("auth handeling can go here");
}

//       **Important in production code:**
// todo: need auth handeling: ./auth.js
// todo: Update bitcoind auth settings to latest standard: rpcauth=user:passwordhash
//       to use "rpcauth=" in regtest with multipule nodes requires unique hashes for each node.
// const rpcauth = {
//   user: "jamesdon",
//   password: ":01714fd71a8c04711b73191ebcd2c7bb$20860750b73dbc98d5a793cc92a91c89541dd3beceac51bcb91a3c4d9268e23a",
// };
// rpcauth=${auth.user + auth.password}
if (paths.length === 0) {
  console.log("ERROR: no paths found..");
}

for (let i = ports.length; i--; ) {
  const port = ports[i].port;
  const rpc = ports[i].rpc;
  // using unsecure auth settings "rpcuser" and "rpcpassword"
  const conf = `
        regtest=1
        debug=rpc
        server=1
        rpcuser=jamesdon
        rpcpassword=thisisnotapassword
        datadir=${db}${pkgName}/node${i}/
        [regtest]
        bind=127.0.0.1:${port}
        rpcport=${rpc}
        port=${port}

        `;
  writeFile(`${db}${pkgName}/node${i}/bitcoin.conf`, conf, (err) => {
    if (err) console.log(err);
    console.log("bitcoin.conf:", true);
  });
}

// Node env is set at this point.
const nodesReady = [];
for (let i = paths.length; i--; ) {
  // Build a "ready to run" node Object.
  const nodeName = paths[i].slice(58, 63);
  const node = {
    name: nodeName,
    key: nodeName.slice(4, 5),
    ports: ports[i],
    paths: paths[i],
    running: false,
    wallet: ''
  };

  nodesReady.push(node);
}
// Time to run the start bitcoind.
if (nodesReady.length > 0) {
  for (let i = nodesReady.length; i--; ) {
    const start = spawn(
      "bitcoind",
      [
        "-daemon",
        "-conf=" + db + pkgName + "/node" + nodesReady[i].key + "/bitcoin.conf",
      ],
      { encoding: "utf-8", stdio: "pipe" }
    );
    start.stderr.on("data", (data) => {
      console.log("errror:", data.toString());
    });

    start.stdout.on("data", (data) => {
      //  console.log(`node ready:${nodesReady[i].key}`,data.toString());
      if (data) {
        nodesReady[i].running = true;
      }
    });

    start.on("close", (data) => {
      console.log("Node started, closing processes. ", data);
      console.log("node started:", nodesReady[i].running);
    });
  }
}

const createWallet = 'bitcoin-cli -regtest -rpcport=8333 -datadir="/Users/turtle/Library/Application Support/Bitcoin/regtestnet/node0" createwallet testwallet';

// write node details to file?
// if (nodesReady.running === true) {
//     for (let i = nodesReady.length; i--; ) {
//         const start = spawn(
//           "bitcoin-cli",
//           [
//             "-regtest",
//             `-rpcport=${nodesReady[i].ports.rpc}`,
//             "-datadir" + db + pkgName + "/node" + nodesReady[i].key,
//             "createwallet",
//             "testwallet"
//           ],
//           { encoding: "utf-8", stdio: "pipe" }
//         );
//         start.stderr.on("data", (data) => {
//           console.log("errror:", data.toString());
//         });
    
//         start.stdout.on("data", (data) => {
//           //  console.log(`node ready:${nodesReady[i].key}`,data.toString());
//           if (data) {
//             nodesReady[i].wallet = "testwallet";
//           }
//         });
    
//         start.on("close", (data) => {
//           console.log("Node started, closing processes. ", data);
//           console.log("node started:", nodesReady[i].running);
//         });
//       }
// }


// using setTimeout to "hang" the process allowing for time for start up.
setTimeout(() => {
  nodeController(nodesReady);
}, 5000);
/**
 *
 * @todo add switch statement to handle node selection and command.
 */
const nodeController = (nodesReady) => {
  console.log(nodesReady);
  process.stdout.write(
    `what node number do you want to use? 0-${+nodesReady.length}`
  );
  process.stdin.resume();
  process.stdin.setEncoding("utf-8");

  let buffer = "";
  process.stdin.on("data", (data) => {
    buffer += data.trim();
    switch (buffer) {
        case '1':
          for (let i = nodesReady.length; i--; ) {
              const start = spawn(
                "bitcoin-cli",
                [
                  "-regtest",
                  `-rpcport=${nodesReady[i].ports.rpc}`,
                  "-datadir" + db + pkgName + "/node" + nodesReady[i].key,
                  "createwallet",
                  "testwallet"
                ],
                { encoding: "utf-8", stdio: "pipe" }
              );
              start.stderr.on("data", (data) => {
                console.log("errror:", data.toString());
              });
          
              start.stdout.on("data", (data) => {
                //  console.log(`node ready:${nodesReady[i].key}`,data.toString());
                if (data) {
                  nodesReady[i].wallet = "testwallet";
                }
              });
          
              start.on("close", (data) => {
                console.log("Node started, closing processes. ", data);
                console.log("node started:", nodesReady[i].running);
              });
              break;
          }
    }
  });

};

// "SIGINT" signal interupt which triggers node stop command.
// if the need to abort arisies use "control + c". (mac)
process.on("SIGINT", () => {
  console.log("\nInterupting process.");
  // Stop bitcoind
  for (let i = nodesReady.length; i--; ) {
    const bitcoinStop = `bitcoin-cli -rpcport=${nodesReady[i].ports.rpc}  -datadir="${db}${pkgName}/node${nodesReady[i].key}" stop`;
    console.log("stop commands here:", bitcoinStop);
    exec(bitcoinStop, (error, stdout, stderr) => {
      if (error) {
        console.log("error", error);
        process.exit(0);
      }
      if (stderr) {
        console.log("stderr", stderr);
        process.exit(0);
      }
      if (stdout) {
        console.log(stdout, nodesReady[i].key);
        nodesReady[i].running = false
        process.exit(0);
      }
    });
  }
});
