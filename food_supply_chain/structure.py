import os

def print_tree(startpath, indent="", file=None):
    for item in sorted(os.listdir(startpath)):
        path = os.path.join(startpath, item)
        if os.path.isdir(path):
            line = f"{indent}├── {item}/"
            print(line)
            if file:
                file.write(line + "\n")
            print_tree(path, indent + "│   ", file)
        else:
            line = f"{indent}├── {item}"
            print(line)
            if file:
                file.write(line + "\n")

if __name__ == "__main__":
    root_dir = "."
    output_file = "structure.txt"
    
    print("📁 Project Folder Structure\n")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("📁 Project Folder Structure\n\n")
        print_tree(root_dir, file=f)

    print(f"\n✅ Folder structure saved to {output_file}")
