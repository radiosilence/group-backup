# Group Backup Script

So the script backs up a list of groups.

## Requirements

* Vague familiarity with running programs from the terminal
* [Node.js](https://nodejs.org/en/) current installed
* Being an admin/manager of the group you want to backup

### Get an access token

Go to [Graph API explorer](https://developers.facebook.com/tools/explorer) while
logged into Facebook. There will be a box at the top that says "access token".

Copy that and store it somewhere safe for later. You want to be getting a "User
Access Token" and the only permission you need to check is `user_managed_groups`


## What to do

### 1. Clone/download this script

Using terminal, run `git clone https://github.com/radiosilence/group-backup`

### 2. Change directory to the project

Using terminal, run `cd group-backup`

### 2. Install dependencies

Using terminal run `npm i`

### 3. Edit the file in the `config` directory called `default.yml`

So it looks soething like this (replace the three UNDERSCORED_BITS) with
relevant info

```yaml
facebook:
  groups:
    - name: My Excellent Facebook Group
      id: 12353465404586

  accessToken: EAACEdEosDSDSDAStZBwuEOmrHvDX5ZBAuCtLmIKNyx2e5eX9dZB....XaSDASDASD
```

### 4. Run the script

In the terminal: `npm start`

### 5. Wait ages

Then your group backup should be output in the same folder as
`your-group.backup.txt`

This file a YAML file, it is basically a text file but with structured data that
is fairly human readable but also readable to computers.

Hi KJ!!!