import { Module } from '@nestjs/common';
import { DirectoryModule } from 'src/directory/directory.module';
import { ProjectModule } from '../project/project.module';
import { FileResolver } from './file.resolver';
import { FileService } from './file.service';

@Module({
  imports: [DirectoryModule, ProjectModule],
  providers: [FileResolver, FileService],
})
export class FileModule {}
