import { calcParkingFee } from '../src/parking.ts';
import { calcSickPay } from '../src/sickPay.ts';

const [command, ...args] = process.argv.slice(2);

try {
  if (command === 'parking' && args.length >= 1) {
    const [minutes, ...flags] = args;
    if (flags.some((flag) => !['--night', '--weekend'].includes(flag))) {
      throw new Error('UNKNOWN_OPTION');
    }
    const amount = calcParkingFee(Number(minutes), {
      night: flags.includes('--night'),
      weekend: flags.includes('--weekend'),
    });
    process.stdout.write(`Parking fee: ${amount.toFixed(2)} UAH\n`);
  } else if (command === 'sick' && args.length === 2) {
    const amount = calcSickPay(Number(args[0]), Number(args[1]));
    process.stdout.write(`Sick pay: ${amount.toFixed(2)} UAH\n`);
  } else {
    throw new Error(
      'Usage: node tools/cli.ts parking <minutes> [--night] [--weekend]\n' +
        '       node tools/cli.ts sick <days> <dailyAverageUAH>',
    );
  }
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
