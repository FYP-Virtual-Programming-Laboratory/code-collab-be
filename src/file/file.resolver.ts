import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ProjectService } from 'src/project/project.service';
import { DeleteFileArgs } from './dtos/delete-file.args';
import { NewFileArgs } from './dtos/new-file.args';
import { UpdateFileNameArgs } from './dtos/update-file-name.args';
import { UpdateFileArgs } from './dtos/update-file.args';
import { FileService } from './file.service';
import { File } from './models/file.model';
import { Version } from './models/version.model';

@Resolver(() => File)
export class FileResolver {
  constructor(
    private filesService: FileService,
    private projectService: ProjectService,
  ) {}

  @ResolveField()
  async size(@Parent() file: File) {
    return Buffer.byteLength(file.content, 'utf8');
  }

  @Mutation(() => File, {
    description: 'Create a new file. Returns the new file',
  })
  async newFile(@Args() { filePath, projectId, initialContent }: NewFileArgs) {
    return this.filesService.getOrCreateFile(
      projectId,
      filePath,
      initialContent,
    );
  }

  @Mutation(() => File, {
    description:
      "Update a file's content and create a version for the file. Returns the file.",
  })
  async updateFile(
    @Args()
    { fileId, newContent, projectId, yDocUpdates, snapshot }: UpdateFileArgs,
    @Context('user') user: string,
  ) {
    await this.projectService.storeYDoc(projectId, yDocUpdates);
    return this.filesService.updateFile({
      fileId,
      newContent,
      user,
      snapshot,
    });
  }

  @Mutation(() => File, {
    description: "Update a file's name. Returns the file.",
  })
  async updateFileName(
    @Args()
    { fileId, newName, projectId, yDocUpdates, snapshot }: UpdateFileNameArgs,
    @Context('user') user: string,
  ) {
    await this.projectService.storeYDoc(projectId, yDocUpdates);
    return this.filesService.updateFileName({
      fileId,
      newName,
      user,
      snapshot,
    });
  }

  @Query(() => [File], {
    description:
      'List all files in a project. Returns an empty array if no files are found or if project does not exist.',
  })
  async listFiles(@Args('projectId', { type: () => Int }) projectId: number) {
    return this.filesService.listFiles(projectId);
  }

  @Query(() => [Version], {
    description:
      'Get all versions of a file by file `id`. Returns an empty array if file with the id does not exist.',
  })
  async getFileVersions(@Args('fileId', { type: () => Int }) fileId: number) {
    return this.filesService.getFileHistory(fileId);
  }

  @Query(() => File, {
    nullable: true,
    description: 'Get a file by its id.',
  })
  async getFile(@Args('fileId', { type: () => Int }) fileId: number) {
    return this.filesService.getFile(fileId);
  }

  @Mutation(() => File, {
    description: 'Delete a file by its id.',
  })
  async deleteFile(@Args() { fileId }: DeleteFileArgs) {
    return this.filesService.deleteFile(fileId);
  }
}
