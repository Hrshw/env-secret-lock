# VHS Tape Script for env-secret-lock Demo
# Render with: vhs < demo.tape

Output assets/demo.gif

Set FontSize 16
Set Width 900
Set Height 450
Set Theme "Catppuccin Mocha"
Set WindowBar True
Set Padding 20

# --- STEP 1: Attempt Plaintext Commit (Blocked!) ---
Type "git add .env"
Sleep 500ms
Enter
Sleep 1s

Type "git commit -m 'Oops, adding Stripe key'"
Sleep 800ms
Enter
Sleep 2.5s

# --- STEP 2: Encrypt plain text ---
Type "git restore --staged .env"
Enter
Sleep 500ms

Type "secret-lock encrypt"
Sleep 800ms
Enter
Sleep 1.2s

# Simulate Password Prompts
Type "rahulsecret"
Enter
Sleep 1s
Type "rahulsecret"
Enter
Sleep 2s

# --- STEP 3: Run In-Memory ---
Type "rm .env"
Enter
Sleep 1s

Type "secret-lock run 'node index.js'"
Sleep 800ms
Enter
Sleep 1.2s

Type "rahulsecret"
Enter
Sleep 4s
