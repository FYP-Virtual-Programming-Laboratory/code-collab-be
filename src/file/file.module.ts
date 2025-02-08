import { Module } from '@nestjs/common';
import { ProjectModule } from 'src/project/project.module';
import { FileResolver } from './file.resolver';
import { FileService } from './file.service';

@Module({
  imports: [ProjectModule],
  providers: [FileResolver, FileService],
})
export class FileModule {}
