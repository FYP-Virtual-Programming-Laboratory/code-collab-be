FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml /app/
RUN pnpm install --frozen-lockfile

COPY . /app
RUN chmod +x ./start_script.sh
RUN pnpm exec prisma generate
RUN pnpm run build

EXPOSE 3000
EXPOSE 1234
EXPOSE 4444

ENV DATABASE_URL=file:./database.db

CMD [ "pnpm", "start:app" ]