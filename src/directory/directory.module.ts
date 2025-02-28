import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module';
import { DirectoryResolver } from './directory.resolver';
import { DirectoryService } from './directory.service';

@Module({
  imports: [ProjectModule],
  providers: [DirectoryService, DirectoryResolver],
  exports: [DirectoryService],
})
export class DirectoryModule {}
