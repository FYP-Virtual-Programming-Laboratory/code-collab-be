import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ProjectService } from 'src/project/project.service';
import { NewFileArgs } from './dtos/new-file.args';
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

  @ResolveField()
  async contributions(@Parent() file: File) {
    return this.filesService.getFileContributions(file.id);
  }

  @Mutation(() => File, {
    description: 'Create a new file. Returns the new file',
  })
  async newFile(@Args() { filePath, projectId, initialContent }: NewFileArgs) {
    return this.filesService.createFile(projectId, filePath, initialContent);
  }

  @Mutation(() => File, {
    description: "Update a file's content. Returns the file.",
  })
  async updateFile(
    @Args() { fileId, newContent, projectId, yDocUpdates }: UpdateFileArgs,
  ) {
    await this.projectService.storeYDoc(projectId, yDocUpdates);
    return this.filesService.updateFile(fileId, newContent);
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
}
