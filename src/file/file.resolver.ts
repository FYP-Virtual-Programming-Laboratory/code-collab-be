import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { FileService } from './file.service';
import { FileMeta } from './models/file-meta.model';
import { File } from './models/file.model';
import { Version } from './models/version.model';

@Resolver(() => File)
export class FileResolver {
  constructor(private filesService: FileService) {}

  @Query(() => [File])
  async listFiles(@Args('projectId', { type: () => Int }) projectId: number) {
    return this.filesService.listFiles(projectId);
  }

  @Query(() => FileMeta)
  async getFileMeta(@Args('fileId', { type: () => Int }) fileId: number) {
    return this.filesService.getFileMeta(fileId);
  }

  @Query(() => String)
  async getFileContent(@Args('fileId', { type: () => Int }) fileId: number) {
    return this.filesService.getFileContent(fileId);
  }

  @Query(() => [Version])
  async getFileVersions(@Args('fileId', { type: () => Int }) fileId: number) {
    return this.filesService.getFileHistory(fileId);
  }
}
