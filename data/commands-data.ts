import { CommandsResponse } from "@/types";
import {
  DOCKER_COMMAND_CATEGORIES,
  DOCKER_COMMANDS,
  DOCKER_TEMPLATES,
} from "./commands/docker-commands";
import { GIT_COMMAND_CATEGORIES, GIT_COMMANDS } from "./commands/git-commands";
import { LINUX_COMMAND_CATEGORIES, LINUX_COMMANDS } from "./commands/linux";
import {
  NGINX_CATEGORIES,
  NGINX_COMMANDS,
  NGINX_CONFIGS,
} from "./commands/nginx";

// cheatsheet 页面的所有数据都在这儿填充
const data: CommandsResponse[] = [
  {
    id: "git",
    icon: "GitBranch",
    title: "Git Cheatsheet",
    description:
      "Quick reference for Git commands. Never forget how to use Git again!",
    commands: GIT_COMMANDS,
    categories: GIT_COMMAND_CATEGORIES,
    templates: [],
  },
  {
    id: "docker",
    icon: "siDocker",
    title: "Docker Cheatsheet",
    description:
      "Quick reference for Docker commands. Never forget how to use Git again!",
    commands: DOCKER_COMMANDS,
    categories: DOCKER_COMMAND_CATEGORIES,
    templates: DOCKER_TEMPLATES,
  },
  {
    id: "linux",
    icon: "siLinux",
    title: "Linux Cheatsheet",
    description:
      "Quick reference for Linux commands. Never forget how to use Git again!",
    commands: LINUX_COMMANDS,
    categories: LINUX_COMMAND_CATEGORIES,
    templates: [],
  },
  {
    id: "nginx",
    icon: "siNginx",
    title: "Nginx Cheatsheet",
    description:
      "Quick reference for Nginx configs. Never forget how to use Git again!",
    commands: NGINX_COMMANDS,
    categories: NGINX_CATEGORIES,
    templates: NGINX_CONFIGS,
  },
];
const getCommands = async (id: string): Promise<CommandsResponse> => {
  const result = data.find((ele) => ele.id === id);
  return result ? result : data[0];
};

export default getCommands;
