import { PrismaClient } from "@prisma/client";
import { currentVersion, migrations } from "../tools/migrations";

export class Migrate {
  private prismaClient: PrismaClient;

  constructor(client: PrismaClient) {
    this.prismaClient = client;
  }

  /**
   * Tries to perform a migration up or fails if error.
   */
  async tryUp(): Promise<number | null> {
    // todo: We still employ Prisma here so the version counter always exists.

    const currentSupportedVersion = currentVersion;

    const result = await this.prismaClient.$queryRaw`SELECT key, value FROM system WHERE key IN ('version-counter', 'version-label', 'migration-error')` as { key: string, value: string }[];

    const rawVersionCounter = result.find(r => r.key === 'version-counter')?.value ?? null;

    let versionCounter = rawVersionCounter !== null ? parseInt(rawVersionCounter) : 0;
    const versionLabel = result.find(r => r.key === 'version-label')?.value ?? null;
    const migrationError = result.find(r => r.key === 'migration-error')?.value ?? null;

    for (let migrateTo = versionCounter + 1; migrateTo <= currentSupportedVersion; migrateTo++) {
      console.log(`Migrating to version ${migrateTo}...`);
      const migrationScript = migrations[migrateTo];
      await migrationScript();
      await this.prismaClient.$executeRaw`UPDATE system SET value = ${migrateTo} WHERE key = 'version-counter'`;
      versionCounter = migrateTo;
    }

    if (migrationError !== null) {
      throw new Error(`There was an unrecoverable error during migration. Manual intervention is required.\nLast version: ${versionCounter ?? 'unknown'}: ${versionLabel ?? 'unknown'}\n${migrationError}`);
    }

    if (currentSupportedVersion < versionCounter) {
      console.error(`Data version: ${versionCounter ?? 'unknown'}: ${versionLabel ?? 'unknown'}`);
      console.error(`Current supported version: ${currentSupportedVersion}`);
      throw new Error(`Unfortunately this version of data is too new for this version of the software. Please upgrade the software or manually downgrade the data. Nothing was changed. The software will now exit.`);
    }

    return versionCounter;
  }
}