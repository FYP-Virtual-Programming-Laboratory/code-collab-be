import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NewFileArgs } from './dtos/new-file.args';
import { FileService } from './file.service';
import { FileMeta } from './models/file-meta.model';
import { File } from './models/file.model';
import { Version } from './models/version.model';

@Resolver(() => File)
export class FileResolver {
  constructor(private filesService: FileService) {}

  @Mutation(() => File, {
    description: 'Create a new file. Returns the new file',
  })
  async newFile(@Args() { filePath, projectId, initialContent }: NewFileArgs) {
    return this.filesService.createFile(projectId, filePath, initialContent);
  }

  @Query(() => [File], {
    description:
      'List all files in a project. Returns an empty array if no files are found or if project does not exist.',
  })
  async listFiles(@Args('projectId', { type: () => Int }) projectId: number) {
    return this.filesService.listFiles(projectId);
  }

  @Query(() => FileMeta, {
    nullable: true,
    description:
      'Get file metadata by file `id`. Returns `null` if file with the id does not exist.',
  })
  async getFileMeta(@Args('fileId', { type: () => Int }) fileId: number) {
    return this.filesService.getFileMeta(fileId);
  }

  @Query(() => String, {
    nullable: true,
    description:
      'Get file content by file `id`. Returns `null` if file with the id does not exist.',
  })
  async getFileContent(@Args('fileId', { type: () => Int }) fileId: number) {
    return this.filesService.getFileContent(fileId);
  }

  @Query(() => [Version], {
    description:
      'Get all versions of a file by file `id`. Returns an empty array if file with the id does not exist.',
  })
  async getFileVersions(@Args('fileId', { type: () => Int }) fileId: number) {
    return this.filesService.getFileHistory(fileId);
  }
}
