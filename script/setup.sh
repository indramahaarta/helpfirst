#!/bin/bash

echo "Start to execute script"
echo "============================================================"

copy_env_file() {
    local dir=$1
    local env_file_name=$2

    cp .env "./$dir/$env_file_name"
    echo "Environment file copied to $dir/$env_file_name"
    echo "'$dir': Done"
    echo "============================================================"
}

declare -a repos=( 
    "helpfirst-fe|.env"
    "helpfirst-be|app.env"
)

for repo in "${repos[@]}"; do
    IFS='|' read -r dir env_file_name <<< "$repo"
    copy_env_file "$dir" "$env_file_name"
done

if command -v docker >/dev/null 2>&1; then
    echo "Docker is installed."
else
    echo "Docker is not installed. Please install :)"
    exit 1
fi

if command -v docker-compose >/dev/null 2>&1; then
    echo "Docker Compose is installed."
else
    echo "Docker Compose is not installed. Please install; :)"
    exit 1
fi

docker-compose up -d --build
docker image prune -f
