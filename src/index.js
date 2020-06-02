
import yargs from 'yargs'
// import config from './config/get'
import config from './config'
import {campaigns,client, streamSignatures} from './api'
import {decryptSignatures} from './crypto'
// import {getCount,getSignature} from './lib/server.js'


async function setup(argv) {
  config.setup()
}

function argv2client(argv) {
  const c = client({url: argv.url, user: argv.user, password: argv.password})
  return c
}

async function listCampaigns(argv) {
  const c = argv2client(argv)
  const resp = await campaigns(c, argv.org)
  resp.data.org.campaigns.forEach((camp) => {
    console.log(`${camp.id}. ${camp.name}:	${camp.title} (${camp.stats.supporterCount} supporters)`)
    camp.stats.actionCount.forEach(({actionType, count}) => {
      console.log(`  ${actionType}: ${count}`)
    })
  })
}

async function getSupporters(argv) {
  const c = argv2client(argv)
  await streamSignatures(c, argv.org, argv.campaignId, (sigs) => {
    const signatures = decryptSignatures(sigs, config)
    console.log(signatures)
  })
  
}

export function main() {
  const argv = yargs.scriptName("proca-gw")
        .command('setup', 'configure proca CLI (generates .env file)', y => y, setup)
        .option('o', {
          alias: 'org',
          type: 'string',
          describe: 'org name',
          default: config.org
        })
        .option('u', {
          alias: 'user',
          type: 'string',
          describe: 'user email',
          default: config.user
        })
        .option('p', {
          alias: 'password',
          type: 'string',
          describe: 'password',
          default: config.password
        })
        .option('a', {
          alias: 'url',
          type: 'string',
          describe: 'api url (without path)',
          default: config.url
        })
        .command('campaigns', 'List campaigns for org',y => y, listCampaigns)
        .command('supporters', 'Downloads supporters',  (yargs) => {
          return yargs.option('c', {alias: 'campaignId', type: 'integer', describe: 'campaign id'})
        }, getSupporters)
        .argv
}

main()


// async function start (actionPage) {
//   const data= await getSignature("realgreendeal",3,{limit:100,authorization:config.authorization});
//   const key=util.decodeBase64(data.org.signatures.public_key);
//   const private_key=util.decodeBase64(config.private_key);
// //  console.log(data.org.campaigns);
//   process.stdout.write("[\n");
//   let first=true;
//   data.org.signatures.list.forEach(s => {
// //    console.log("message:"+s.contact+"\nnounce:"+ s.nonce+"\nkey:" +key+"\nprivate:"+ config.private_key);
//     const d = util.encodeUTF8(nacl.box.open(util.decodeBase64(s.contact), util.decodeBase64(s.nonce), key, private_key));
//     //d = JSON.parse(d);
//     first ? first=false :  process.stdout.write(","); 
//     process.stdout.write(d+"\n");
//   });
//   process.stdout.write("]\n");

// }

// start (3);
