import os
import emoji

def clean_file_content(target_directory, dry_run=True):
    # Folders to explicitly ignore to prevent breaking libraries or git history
    IGNORE_DIRS = {'.git', 'node_modules', '__pycache__', 'venv', 'env', '.idea', '.vscode'}
    
    # Extensions to ignore (binary files, images, etc.)
    IGNORE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.pyc'}

    print(f"--- Processing Content in: {target_directory} ---")
    if dry_run:
        print("*** DRY RUN MODE: No files will be modified ***\n")

    files_modified = 0

    for root, dirs, files in os.walk(target_directory):
        # Modify 'dirs' in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for filename in files:
            file_path = os.path.join(root, filename)
            
            # Skip known binary extensions
            if any(filename.lower().endswith(ext) for ext in IGNORE_EXTENSIONS):
                continue

            try:
                # Try to read the file as text (UTF-8)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check if there are emojis
                if emoji.emoji_count(content) > 0:
                    
                    # Create clean content
                    new_content = emoji.replace_emoji(content, replace='')
                    
                    print(f"[FOUND EMOJIS] {file_path}")
                    
                    if not dry_run:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"   └── [CLEANED] Saved file without emojis.")
                    else:
                        print(f"   └── [WOULD CLEAN] (Dry Run)")
                    
                    files_modified += 1
            
            except UnicodeDecodeError:
                # This catches binary files that aren't text (like weird system files)
                continue
            except Exception as e:
                print(f"[ERROR] Could not read {file_path}: {e}")

    print(f"\n--- Complete. Files with emojis detected: {files_modified} ---")

# --- CONFIGURATION ---
# 1. Update this path to your folder
folder_path = '/Users/aakritigarodia/Desktop/agent_exp/dorian'

# 2. Set dry_run=False to actually overwrite the files
clean_file_content(folder_path, dry_run=False)