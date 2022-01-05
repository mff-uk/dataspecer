import {spawn, SpawnOptionsWithoutStdio} from 'child_process';

export class WrappedChildProcess {
    private readonly command: string;
    private readonly args: string[];
    private input: string | null = null;
    private directory: string | null = null;

    constructor(command: string, args: string[] = []) {
        this.command = command;
        this.args = args;
    }

    setInput(input: string): WrappedChildProcess {
        this.input = input;
        return this;
    }

    setWorkingDirectory(directory: string): WrappedChildProcess {
        this.directory = directory;
        return this;
    }

    execute(): Promise<string> {
        return new Promise((resolve, reject) => {
            const options: SpawnOptionsWithoutStdio = {};
            if (this.directory) {
                options.cwd = this.directory;
            }

            const child = spawn(this.command, this.args, options);

            if (this.input) {
                child.stdin.write(this.input);
                child.stdin.end();
            }

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data: Buffer) => {
                stdout += data.toString();
                stderr += data.toString();
            });
            child.stderr.on('data', (data: Buffer) => {
                stderr += data.toString();
            });
            child.on('close', (code: number) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(stderr);
                }
            });
        });
    }
}
