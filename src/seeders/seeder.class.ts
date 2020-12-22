abstract class Seeder {
  abstract shouldRun(): Promise<boolean>;
  abstract run(): void;
}

export default Seeder;
