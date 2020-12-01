import * as shell from 'shelljs';

shell.cp('-R', 'src/public/js/lib', 'dist/public/js/');
shell.cp('-R', 'src/public/fonts', 'dist/public/');
shell.cp('-R', 'src/public/images', 'dist/public/');
shell.cp('-R', 'src/private', 'dist/private/');
shell.cp('-R', 'src/views', 'dist/views/');
