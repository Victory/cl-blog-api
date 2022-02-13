import CSLogger from './CSLogger';
import initData from './initData';
import startServer from './startServer';

const main = async () => {
  await initData();
  startServer(8080);
  CSLogger.log('Shutdown App by pressing ctrl-c');
};

main();
