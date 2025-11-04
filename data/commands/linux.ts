import { Command, CommandCategory } from "@/types";

export const LINUX_COMMAND_CATEGORIES: CommandCategory[] = [
  {
    id: "file-system",
    name: "File System",
    type: "command",
    description: "File and directory management commands",
  },
  {
    id: "text-processing",
    name: "Text Processing",
    type: "command",
    description: "Commands for processing and manipulating text",
  },
  {
    id: "system-info",
    name: "System Info",
    type: "command",
    description: "Commands for system information and monitoring",
  },
  {
    id: "networking",
    name: "Networking",
    type: "command",
    description: "Network related commands",
  },
  {
    id: "process-management",
    name: "Process Management",
    type: "command",
    description: "Process control and management commands",
  },
  {
    id: "permissions",
    name: "Permissions",
    type: "command",
    description: "File and directory permission commands",
  },
  {
    id: "compression",
    name: "Compression",
    type: "command",
    description: "File compression and archiving commands",
  },
  {
    id: "search",
    name: "Search",
    type: "command",
    description: "File and text search commands",
  },
];

export const LINUX_COMMANDS: Command[] = [
  // File System Commands
  {
    id: "ls",
    name: "ls",
    language: "bash",
    description: "List directory contents",
    command: "ls [options] [directory]",
    example: "ls -la /home/user\nls -lh\nls -F",
    category: "file-system",
  },
  {
    id: "cd",
    name: "cd",
    language: "bash",
    description: "Change directory",
    command: "cd [directory]",
    example: "cd /home/user\ncd ..\ncd ~\ncd -",
    category: "file-system",
  },
  {
    id: "pwd",
    name: "pwd",
    language: "bash",
    description: "Print working directory",
    command: "pwd",
    example: "pwd",
    category: "file-system",
  },
  {
    id: "mkdir",
    name: "mkdir",
    language: "bash",
    description: "Create directories",
    command: "mkdir [options] directory...",
    example: "mkdir new_dir\nmkdir -p path/to/new_dir\nmkdir -m 755 secure_dir",
    category: "file-system",
  },
  {
    id: "rm",
    language: "bash",
    name: "rm",
    description: "Remove files or directories",
    command: "rm [options] file...",
    example: "rm file.txt\nrm -r directory\nrm -f file.txt\nrm -rf directory",
    category: "file-system",
  },
  {
    id: "cp",
    name: "cp",
    language: "bash",
    description: "Copy files or directories",
    command: "cp [options] source destination",
    example: "cp file1.txt file2.txt\ncp -r dir1 dir2\ncp -v file.txt /backup/",
    category: "file-system",
  },
  {
    id: "mv",
    name: "mv",
    language: "bash",
    description: "Move or rename files/directories",
    command: "mv [options] source destination",
    example:
      "mv old_name.txt new_name.txt\nmv file.txt /home/user/\nmv dir1 dir2",
    category: "file-system",
  },

  // Text Processing Commands
  {
    id: "cat",
    name: "cat",
    language: "bash",
    description: "Concatenate and display file content",
    command: "cat [options] [file...]",
    example:
      "cat file.txt\ncat file1.txt file2.txt > combined.txt\ncat -n file.txt",
    category: "text-processing",
  },
  {
    id: "less",
    name: "less",
    language: "bash",
    description: "View file content one page at a time",
    command: "less [options] file",
    example: "less large_file.txt\nless +100 file.txt\nless -N file.txt",
    category: "text-processing",
  },
  {
    id: "head",
    name: "head",
    language: "bash",
    description: "Output the first part of files",
    command: "head [options] [file...]",
    example: "head file.txt\nhead -n 20 file.txt\nhead -c 100 file.txt",
    category: "text-processing",
  },
  {
    id: "tail",
    name: "tail",
    language: "bash",
    description: "Output the last part of files",
    command: "tail [options] [file...]",
    example: "tail file.txt\ntail -n 20 file.txt\ntail -f log.txt",
    category: "text-processing",
  },
  {
    id: "wc",
    name: "wc",
    language: "bash",
    description: "Print newline, word, and byte counts",
    command: "wc [options] [file...]",
    example: "wc file.txt\nwc -l file.txt\nwc -w file.txt\nwc -c file.txt",
    category: "text-processing",
  },
  {
    id: "sort",
    name: "sort",
    language: "bash",
    description: "Sort lines of text files",
    command: "sort [options] [file...]",
    example:
      "sort file.txt\nsort -r file.txt\nsort -k2 file.txt\nsort -u file.txt",
    category: "text-processing",
  },
  {
    id: "uniq",
    name: "uniq",
    language: "bash",
    description: "Report or omit repeated lines",
    command: "uniq [options] [file]",
    example:
      "uniq file.txt\nuniq -c file.txt\nuniq -d file.txt\nuniq -u file.txt",
    category: "text-processing",
  },

  // grep Commands (重点)
  {
    id: "grep-basic",
    name: "grep (Basic)",
    language: "bash",
    description: "Search for patterns in files",
    command: "grep [options] pattern [file...]",
    example:
      "grep 'pattern' file.txt\ngrep 'error' /var/log/syslog\ngrep -i 'Error' file.txt",
    category: "text-processing",
  },
  {
    id: "grep-recursive",
    name: "grep (Recursive)",
    language: "bash",
    description: "Search recursively in directories",
    command: "grep -r [options] pattern directory",
    example:
      "grep -r 'function' .\ngrep -r --include='*.js' 'console.log' src/\ngrep -r -i 'TODO' .",
    category: "text-processing",
  },
  {
    id: "grep-regex",
    name: "grep (Regex)",
    language: "bash",
    description: "Use regular expressions with grep",
    command: "grep -E [options] pattern [file...]",
    example:
      "grep -E '^[0-9]{3}-[0-9]{3}-[0-9]{4}$' file.txt\ngrep -E '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b' file.txt",
    category: "text-processing",
  },
  {
    id: "grep-context",
    name: "grep (Context)",
    language: "bash",
    description: "Show context around matches",
    command: "grep [options] pattern [file...]",
    example:
      "grep -A 3 'error' log.txt  # Show 3 lines after match\ngrep -B 3 'error' log.txt  # Show 3 lines before match\ngrep -C 3 'error' log.txt  # Show 3 lines before and after match",
    category: "text-processing",
  },
  {
    id: "grep-invert",
    name: "grep (Invert)",
    language: "bash",
    description: "Show lines that don't match",
    command: "grep -v [options] pattern [file...]",
    example:
      "grep -v '^#' config.txt  # Show non-comment lines\ngrep -v -E '^(#|$)' config.txt  # Show non-comment and non-empty lines",
    category: "text-processing",
  },
  {
    id: "grep-count",
    name: "grep (Count)",
    language: "bash",
    description: "Count matching lines",
    command: "grep -c [options] pattern [file...]",
    example: "grep -c 'error' log.txt\ngrep -c -r 'TODO' .",
    category: "text-processing",
  },
  {
    id: "grep-files",
    name: "grep (Files)",
    language: "bash",
    description: "List files containing matches",
    command: "grep -l [options] pattern [file...]",
    example: "grep -l 'function' *.js\ngrep -l -r 'import' src/",
    category: "text-processing",
  },
  {
    id: "grep-line-numbers",
    name: "grep (Line Numbers)",
    language: "bash",
    description: "Show line numbers of matches",
    command: "grep -n [options] pattern [file...]",
    example: "grep -n 'error' log.txt\ngrep -n -r 'TODO' .",
    category: "text-processing",
  },

  // System Info Commands
  {
    id: "ps",
    name: "ps",
    language: "bash",
    description: "Report a snapshot of current processes",
    command: "ps [options]",
    example: "ps\nps aux\nps -ef\nps -u username",
    category: "system-info",
  },
  {
    id: "top",
    name: "top",
    language: "bash",
    description: "Display Linux processes",
    command: "top [options]",
    example: "top\ntop -u username",
    category: "system-info",
  },
  {
    id: "htop",
    name: "htop",
    description: "Interactive process viewer",
    command: "htop",
    example: "htop",
    category: "system-info",
  },
  {
    id: "df",
    name: "df",
    description: "Report file system disk space usage",
    command: "df [options] [file...]",
    example: "df\ndf -h\ndf -h /home",
    category: "system-info",
  },
  {
    id: "du",
    name: "du",
    description: "Estimate file space usage",
    command: "du [options] [file...]",
    example: "du\ndu -h\ndu -sh *\ndu -h --max-depth=1",
    category: "system-info",
  },
  {
    id: "free",
    name: "free",
    description: "Display amount of free and used memory",
    command: "free [options]",
    example: "free\nfree -h\nfree -m",
    category: "system-info",
  },
  {
    id: "uname",
    name: "uname",
    description: "Print system information",
    command: "uname [options]",
    example: "uname\nuname -a\nuname -r",
    category: "system-info",
  },

  // Networking Commands
  {
    id: "ping",
    name: "ping",
    description: "Send ICMP ECHO_REQUEST to network hosts",
    command: "ping [options] destination",
    example: "ping google.com\nping -c 4 google.com",
    category: "networking",
  },
  {
    id: "netstat",
    name: "netstat",
    description:
      "Display network connections, listening ports, and related statistics",
    command: "netstat [options]",
    example:
      "netstat -tuln  # List all listening ports\nnetstat -tulnp  # List listening ports with process info\nnetstat -an | grep :80  # Check connections on port 80",
    category: "networking",
  },
  {
    id: "ss",
    name: "ss",
    description:
      "Another utility to investigate sockets (modern replacement for netstat)",
    command: "ss [options]",
    example:
      "ss -tuln  # List all listening ports\nss -tulnp  # List listening ports with process info\nss -tulnp | grep :80  # Check connections on port 80",
    category: "networking",
  },
  {
    id: "lsof",
    name: "lsof",
    description: "List open files, including network connections",
    command: "lsof [options]",
    example:
      "lsof -i :80  # List processes using port 80\nlsof -i :8080  # List processes using port 8080\nlsof -iTCP -sTCP:LISTEN  # List all listening TCP ports",
    category: "networking",
  },
  {
    id: "fuser",
    name: "fuser",
    description: "Identify processes using files or sockets",
    command: "fuser [options] [file|port]",
    example:
      "fuser 80/tcp  # Show processes using port 80\nfuser -k 80/tcp  # Kill processes using port 80\nfuser -v 80/tcp  # Verbose output for port 80",
    category: "networking",
  },
  {
    id: "wget",
    name: "wget",
    description: "Non-interactive network downloader",
    command: "wget [options] [URL...]",
    example:
      "wget https://example.com/file.txt\nwget -r https://example.com/\nwget -c large_file.zip",
    category: "networking",
  },
  {
    id: "curl",
    name: "curl",
    description: "Transfer data from or to a server",
    command: "curl [options] [URL...]",
    example:
      "curl https://api.example.com/data\ncurl -O https://example.com/file.txt\ncurl -X POST -d 'key=value' https://api.example.com/endpoint",
    category: "networking",
  },
  {
    id: "ssh",
    name: "ssh",
    description: "OpenSSH remote login client",
    command: "ssh [options] [user@]hostname [command]",
    example:
      "ssh user@server.com\nssh -p 2222 user@server.com\nssh user@server.com 'ls -la'",
    category: "networking",
  },
  {
    id: "scp",
    name: "scp",
    description: "Secure copy (remote file copy program)",
    command: "scp [options] [[user@]host1:]file1 [[user@]host2:]file2",
    example:
      "scp file.txt user@server.com:/home/user/\nscp user@server.com:/home/user/file.txt .\nscp -r dir/ user@server.com:/home/user/",
    category: "networking",
  },

  // Process Management Commands
  {
    id: "kill",
    name: "kill",
    description: "Send a signal to a process",
    command: "kill [options] PID...",
    example: "kill 1234\nkill -9 1234\nkillall firefox",
    category: "process-management",
  },
  {
    id: "killall",
    name: "killall",
    description: "Kill processes by name",
    command: "killall [options] name...",
    example: "killall firefox\nkillall -9 chrome",
    category: "process-management",
  },
  {
    id: "nohup",
    name: "nohup",
    description: "Run a command immune to hangups",
    command: "nohup command [args]",
    example:
      "nohup python script.py > output.log 2>&1 &\nnohup ./long_running_process &",
    category: "process-management",
  },

  // Permissions Commands
  {
    id: "chmod",
    name: "chmod",
    description: "Change file mode bits",
    command: "chmod [options] mode[,mode] file...",
    example: "chmod 755 script.sh\nchmod +x script.sh\nchmod -R 755 directory/",
    category: "permissions",
  },
  {
    id: "chown",
    name: "chown",
    description: "Change file owner and group",
    command: "chown [options] [owner][:group] file...",
    example:
      "chown user file.txt\nchown user:group file.txt\nchown -R user:group directory/",
    category: "permissions",
  },
  {
    id: "chgrp",
    name: "chgrp",
    description: "Change group ownership",
    command: "chgrp [options] group file...",
    example: "chgrp developers file.txt\nchgrp -R developers directory/",
    category: "permissions",
  },

  // Compression Commands
  {
    id: "tar",
    name: "tar",
    description: "Manipulate tar archive files",
    command: "tar [options] [archive-file] [file...]",
    example:
      "tar -cvf archive.tar file1 file2\ntar -xvf archive.tar\ntar -czvf archive.tar.gz directory/\ntar -xzvf archive.tar.gz",
    category: "compression",
  },
  {
    id: "gzip",
    name: "gzip",
    description: "Compress or expand files",
    command: "gzip [options] [file...]",
    example:
      "gzip file.txt\ngzip -d file.txt.gz\ngzip -k file.txt  # Keep original file",
    category: "compression",
  },
  {
    id: "zip",
    name: "zip",
    description: "Package and compress files",
    command: "zip [options] zipfile files...",
    example:
      "zip archive.zip file1.txt file2.txt\nzip -r archive.zip directory/\nzip -e secure.zip file.txt  # Encrypt",
    category: "compression",
  },
  {
    id: "unzip",
    name: "unzip",
    description: "List, test and extract compressed files",
    command: "unzip [options] file[.zip]",
    example:
      "unzip archive.zip\nunzip -l archive.zip  # List contents\nunzip -d /extract/here/ archive.zip",
    category: "compression",
  },

  // Search Commands
  {
    id: "find",
    name: "find",
    description: "Search for files in a directory hierarchy",
    command: "find [path...] [expression]",
    example:
      "find . -name 'file.txt'\nfind /home -type f -name '*.log'\nfind . -mtime -7  # Files modified in last 7 days\nfind . -size +100M  # Files larger than 100MB",
    category: "search",
  },
  {
    id: "locate",
    name: "locate",
    description: "Find files by name (uses database)",
    command: "locate [options] pattern...",
    example:
      "locate file.txt\nlocate -i file.txt  # Case insensitive\nlocate *.conf",
    category: "search",
  },
  {
    id: "which",
    name: "which",
    description: "Locate a command",
    command: "which [options] [--] programname [...]",
    example: "which python\nwhich -a python  # Show all matching executables",
    category: "search",
  },
  {
    id: "whereis",
    name: "whereis",
    description: "Locate the binary, source, and manual page files",
    command: "whereis [options] name...",
    example:
      "whereis python\nwhereis -b python  # Only show binary\nwhereis -m python  # Only show manual",
    category: "search",
  },
];
