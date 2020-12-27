abstract class Seeder {
  abstract name: string;
  abstract shouldRun(): Promise<boolean>;
  abstract run(): void;
}

export default Seeder;
