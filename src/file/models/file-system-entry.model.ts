import { createUnionType } from '@nestjs/graphql';
import { Directory } from '../../directory/models/directory.model';
import { File } from './file.model';

export const FileSystemEntry = createUnionType({
  name: 'FileSystemEntry',
  description: 'A union of File and Directory types.',
  types: () => [File, Directory] as const,
  resolveType: (value) => {
    return 'content' in value ? File : Directory;
  },
});
