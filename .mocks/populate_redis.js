const Redis = require('ioredis');


const connection = new Redis(process.env.URL_REDIS);

const newRecord = async (key, value, member = null) => {
  await connection.set(key, value);
  if (member) await connection.sadd(member, key);
};

const watcher01 = ["0xbF91616B0723277A10d513587FEa4De586863A74", "0xb499d8adc01512c763d316aa6513ea4bf19a0120b9d8e0346f8bec48345679fe", "100", "2"];
newRecord("watch:100:0xb499d8adc01512c763d316aa6513ea4bf19a0120b9d8e0346f8bec48345679fe", JSON.stringify(watcher01), "watchers");
const watcher02 = ["0xbF91616B0723277A10d513587FEa4De586863A74", "0xb499d8adc01512c763d316aa6513ea4bf19a0120b9d8e0346f8bec48345679fe", "200", "2"];
newRecord("watch:200:0xb499d8adc01512c763d316aa6513ea4bf19a0120b9d8e0346f8bec48345679fe", JSON.stringify(watcher02), "watchers");
const watcher03 = ["0xbF91616B0723277A10d513587FEa4De586863A74", "0xb499d8adc01512c763d316aa6513ea4bf19a0120b9d8e0346f8bec48345679fe", "300", "2"];
newRecord("watch:300:0xb499d8adc01512c763d316aa6513ea4bf19a0120b9d8e0346f8bec48345679fe", JSON.stringify(watcher03), "watchers");
const watcher04 = ["0xbF91616B0723277A10d513587FEa4De586863A74", "0xb499d8adc01512c763d316aa6513ea4bf19a0120b9d8e0346f8bec48345679fe", "400", "2"];
newRecord("watch:400:0xb499d8adc01512c763d316aa6513ea4bf19a0120b9d8e0346f8bec48345679fe", JSON.stringify(watcher04), "watchers");



newRecord(`count:${watcher01[0]}: ${watcher01[1]}: ${watcher01[2]}`, 2);