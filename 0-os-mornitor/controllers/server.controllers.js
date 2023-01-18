const { CronJob } = require('cron');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const osu = require('node-os-utils');

const model = require('../models/server.model');

module.exports = () => {
    // return new Promise(async (resolve, reject) => {
    let job = new CronJob('*/10 * * * * *', async () => {
        try {
            // linux only
            let server_name = await exec('hostname');
            if (server_name.stderr) throw server_name.stderr;
            server_name = (server_name.stdout).trim().replace('\n', '');
            let server_ip = await exec('dig TXT +short o-o.myaddr.l.google.com @ns1.google.com');
            if (server_ip.stderr) server_ip = '0.0.0.0';
            server_ip = ((server_ip.stdout).trim()).split(' ')[0];
            server_ip = server_ip.replace(/"/ig, '')
            const GB = 1024;
            const cpu = osu.cpu;
            const memory = await osu.mem.info();
            const disk = await osu.drive.info();
            const netstat = await osu.netstat.inOut();
            const net_io = netstat.total;
            let api_list = null;
            api_list = await exec('pm2 list');
            api_list = ((api_list.stdout).split('\n')).slice(3);
            let apis = []
            let total_memory = Number((memory.totalMemMb / GB).toFixed(0, 1));
            for await (let api of api_list) {
                let e = api.split('│').filter(e => e)
                if (e.length === 1) {
                    break;
                } else {
                    let memory = (e[10].trim());
                    let memory_2_str = (memory.substring(memory.length - 2)).trim();
                    if (memory_2_str === 'mb') {
                        memory = Number(memory.replace('mb', ''))
                    } else {
                        let memory_last_str = (memory.substring(memory.length - 1)).trim();
                        if (memory_last_str === 'b') {
                            memory = Number(memory.replace('b', '')) * 1024;
                        } else {
                            memory = null;
                        }
                    }
                    let memory_p = Number(((memory * 100) / (total_memory * 1024)).toFixed(2));
                    let restart_times = (e[7]).trim();
                    if (isNaN(Number(restart_times))) {
                        restart_times = '9999';
                    }
                    apis.push({
                        // id: (e[0]).trim(),
                        name: (e[1]).trim(),
                        mode: (e[4]).trim(),
                        uptime: (e[6]).trim(),
                        restart: Number(restart_times),
                        status: ((e[8]).trim()).toLowerCase(),
                        cpu_p: Number(((e[9]).trim()).replace('%', '')),
                        memory: memory,
                        memory_p: memory_p
                    })
                }
            }
            const data = {
                ip: server_ip,
                name: server_name,
                description: null,
                cpu: {
                    model: cpu.model(),
                    cores: Number(cpu.count()),
                    used_p: Number(await cpu.usage()),
                    free_p: Number(await cpu.free())
                },
                memory: {
                    total: Number((memory.totalMemMb / GB).toFixed(0, 1)),
                    used: Number((memory.usedMemMb / GB).toFixed(2)),
                    free: Number((memory.freeMemMb / GB).toFixed(2)),
                    used_p: Number(100 - Number(memory.freeMemPercentage)),
                    free_p: Number(memory.freeMemPercentage)
                },
                disk: {
                    total: Number(disk.totalGb),
                    used: Number(disk.usedGb),
                    free: Number(disk.freeGb),
                    used_p: Number(disk.usedPercentage),
                    free_p: Number(disk.freePercentage)
                },
                network: {
                    input: Number(net_io.inputMb),
                    output: Number(net_io.outputMb)
                },
                api: apis
            }
            apis = [];
            await model.logging(data);
            /*----------------------------------------------------------------
            console.log('**********************************************************************');
            console.log('Datetime: ', new Date().toISOString());
            console.log('SERVER: ', server_name);
            console.log('IP: ', server_ip);
            console.log(`CPU: ${data.cpu.model} (${data.cpu.cores} Cores)`);
            console.log(`Used Percentage: ${data.cpu.used_p}%`);
            console.log(`Free Percentage: ${data.cpu.free_p}%`);
            console.log('**********************************************************************');
            console.log('Memory');
            console.log(`Total: ${data.memory.total}GB`);
            console.log(`Used: ${data.memory.used}GB`);
            console.log(`Free: ${data.memory.free}GB`);
            console.log(`Used Percentage: ${data.memory.used_p}%`)
            console.log(`Free Percentage: ${data.memory.free_p}%`);
            console.log('**********************************************************************');
            console.log('Disk');
            console.log(`Total: ${data.disk.total}GB`);
            console.log(`Used: ${data.disk.used}GB`);
            console.log(`Free: ${data.disk.free}GB`);
            console.log(`Used Percentage: ${data.disk.used_p}%`);
            console.log(`Free Percentage: ${data.disk.free_p}%`);
            console.log('**********************************************************************');
            ----------------------------------------------------------------*/
            // resolve(null);
        } catch (error) {
            job.stop();
            // reject(error);
        }
    });
    job.start();
    // });
}