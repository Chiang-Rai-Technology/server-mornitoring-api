const { CronJob } = require('cron');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const osu = require('node-os-utils');

const model = require('../models/server.model');

module.exports = () => {
    return new Promise(async (resolve, reject) => {
        let job = new CronJob('*/10 * * * * *', async () => {
            try {
                // linux only
                let server_name = await exec('hostname');
                if (server_name.stderr) throw server_name.stderr;
                server_name = (server_name.stdout).trim().replace('\n', '');
                let server_ip = await exec('hostname -I');
                if (server_ip.stderr) server_ip = '0.0.0.0';
                server_ip = ((server_ip.stdout).trim()).split(' ')[0];
                const GB = 1024;
                const cpu = osu.cpu;
                const memory = await osu.mem.info();
                const disk = await osu.drive.info();
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
                    }
                }
                await model.logging(data);
                /*----------------------------------------------------------------
                console.log('**********************************************************************');
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
                resolve(null);
            } catch (error) {
                job.stop();
                reject(error);
            }
        });
        job.start();
    });
}