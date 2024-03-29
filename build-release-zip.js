const fs = require('fs/promises');
const zip = require('bestzip');
const mkdirp = require('mkdirp');

(
    async function() {
        let manifest = await fetch_manifest();
        await mkdirp("release-builds");
        await make_build(manifest,"browser_specific_settings","chrome");
        await make_build(manifest,"minimum_chrome_version","firefox");
        await fs.writeFile("build/manifest.json",JSON.stringify(manifest),{encoding:'utf-8'})

        console.log('release-zip building process completed successfully');
    }
)()

async function fetch_manifest(){
    let manifest;
    await fs.readFile("./manifest.json",{encoding:"utf-8"})
    .then(data => {
        manifest = JSON.parse(data);
    })
    .catch(err => {
        console.log(err);
    })

    return manifest;
}
async function make_build(manifest,attribute,browser){
    console.log(`zipping ${browser} file`);
    let temp = {... manifest}
    delete temp[attribute];
    temp = JSON.stringify(temp);

    // writing manifest
    await fs.writeFile("./build/manifest.json",temp,{encoding:'utf-8'})
    .catch(err => console.log(err))

    // zipping the final build
    await zip({
        cwd: "build/",
        source:"*",
        destination:`../release-builds/${browser}.zip`
    })
    console.log(`${browser} zip completed\n`);
    return
}