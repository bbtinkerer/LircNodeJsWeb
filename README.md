# LIRC Node.js Web

By bbtinkerer (<http://bb-tinkerer.blogspot.com/>)

## Description

Web based universal IR remote controller using [LIRC](http://www.lirc.org) and [Node.js](https://nodejs.org/en/). Control your TV, cable box, media center, and pretty much anything that has an IR remote control from your computers', tablets', phones' browser. Also define your own macros so you can turn on all devices in one button. Make a dumb TV almost act like a smart TV by writing macros to go to different inputs. Not sure what sound level someone left the speakers at? Write a macro to turn on the device and spam the mute key for a second or two.

## Requirements

* [LIRC](http://www.lirc.org) - Follow instructions from the web to install and setup on your system.
* [Node.js](https://nodejs.org/en/) - Ensure at least 9.3.0 Node.js is installed. I used [audstanley's](http://www.audstanley.com/) scripts at  [NodeJs-Raspberry-Pi ](https://github.com/audstanley/NodeJs-Raspberry-Pi/) to install the latest Node.js. Follow the README.md for instructions on using his script.
* [nodemon](https://nodemon.io/) - A utility that will monitor for any changes in your source and automatically restart your Node.js server. This is good when you are setting up and making your layout.

## Installation

Clone this project to /home/pi/nodejs/LircNodeJsWeb, download required depencencies, and copy the example config files.

```bash
cd ~
mkdir nodejs
git clone https://github.com/bbtinkerer/LircNodeJsWeb.git
cd nodejs/LircNodeJsWeb/config/ 
cp default.example.json default.json
cp production.example.json production.json
cd ..
npm install
```

Start the server and view the website in a browser (should be http://RaspberryPi_IP/) to ensure everything was installed correctly. The site will be a little slow due to that is not running in production mode (see Usage section to set to production mode for better performance). Note: Need to use sudo when listening on port 80.

```bash
sudo PORT=80 npm start
```

You should see a page that resembles a TV remote control. If you see the page, that means all the necessary dependencies are installed. If not, recheck all the steps from above.

## Configuration

### LIRC Remote Configuration

Follow the LIRC instructions on creating configuratin files for your remotes with one caveat, all buttons with "KEY_".  This makes life easier to map LIRC remote buttons to the buttons on the website. Run irrecord with '--disable-namespace' so you can name all your buttons starting with "KEY_".

Example excerpt from an LIRC remote configuration file

```
...
KEY_POWER                0x40BF
KEY_TV                   0xD827
KEY_VOLUME_UP            0x264F
KEY_WHATEVER             0x35AD
...
```

### Node.js config file

Configuration files are in the config folder. The files are:
* default.json - Main configuration file to control what is displayed, map device buttons to correct template file, and define macros. 
* production.json - Empty but needed when running in production mode.

The website is split into 3 sections.
* Header - Displays current device.
* Device Selection - Used to select a different device.
* Remote Buttons - The buttons of the remote controller.

You will need to edit default.json to configure the Device Selection section. Following is an example of the default.json file included with the project.

```json
{
  "devices":{
    "tv":{
      "title": "TV - Samsung",
      "label": "TV",
      "device": "SamsungTv"
    },
    "dvd":{
      "title": "DVD - Magnavox",
      "label": "DVD",
      "device": "MagnavoxDvd"
    },
    "cable":{
      "title": "Cable Box",
      "label": "CABLE",
      "device": "CableBox"
    }
  },
  "macros":{
    "watch_tv": [
      { "device": "tv",    "directive": "SEND_ONCE", "key": "KEY_POWER" },
      { "device": "cable", "directive": "SEND_ONCE", "key": "KEY_POWER" }
    ],
    "game_input":[
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_TV",     "delay": 1000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE", "delay": 2000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE", "delay": 2000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE", "delay": 2000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE", "delay": 2000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE" },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_ENTER"}
    ],
    "toon_tv":[
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_TV" },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_3" },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_5" },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_ENTER" }
    ]
  }
}
```

Here is my try at the schema for the configuration file, hopefully it makes sense. You should be able to deduce from the example above what each setting does by running the project and seeing what is on screen and in the URL of the browser.

```json
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "Devices Configuration",
  "type": "object",
  "required": ["devices"],
  "properties":{
    "devices":{
      "patternProperties": {
        "[A-Za-z]+":{
          "title": "Device",
          "type": "object",
          "required": ["title", "label", "device"],
          "properties": {
            "title":{
              "description": "Text to display in the Header section after selecting a device.",
              "type": "string"
            },
            "label": {
              "description": "Text to display on the Device Selection button.",
              "type": "string"
            },
            "device": {
              "description": "The name used in the LIRC configuration file for the device.",
              "type": "string"
            }
          }
        }
      },
      "description": "Property denotes the type of device and the .pug filename to use for the device."
    },
    "macros":{
      "patternProperties": {
        "[A-Za-z]+":{
          "title": "Macro",
          "type": "array",
          "items:" {
            "type": "object",
            "required": ["device", "directive", "key"],
            "properties":{
              "device": {
                "description": "The name used in the LIRC configuration file for the device.",
                "type": "string"
              },
              "directive": {
                "description": "Directive to give to irsend.",
                "type": "string"
              },
              "key": {
                "description": "Button to press",
                "type": "string"
              },
              "delay": {
                "description": "Time in milliseconds to wait after executing irsend command.",
                "type": "string"
              }
            }
          }
        }
      }
    }
  }
}
```

### Device Buttons Layout Files

This project uses the [pug](https://pugjs.org/api/getting-started.html) engine for templates. There is a pug file (contents detailed in the next section) for each device type specified in the default.json configuration file. For example, there are three pug files included with the project.
* tv.pug
* dvd.pug
* cable.pug

To add a new device such as a media player, add a new entry into default.json and create a pug file in the views folder.

For example: Add entry to default.json
```json
{
  "devices":{
    "tv":{
      "title": "TV - Samsung",
      "label": "TV",
      "device": "SamsungTv"
    },
    "dvd":{
      "title": "DVD - Magnavox",
      "label": "DVD",
      "device": "MagnavoxDvd"
    },
    "cable":{
      "title": "Cable Box",
      "label": "CABLE",
      "device": "CableBox"
    },
    "media":{
      "title": "Kodi",
      "label": "KODI",
      "device": "kodi"
    }
  }
}
```
Then for ease, just copy an existing layout for now. 

```
cd ~/nodejs/LircNodeJsWeb/views
cp tv.pug media.pug
```

Nodemon should be running and will pick up your changes. Refresh your browser page and you should see the new device in the selection area and the button layout is a copy of the tv button layout.

#### Button Template Layout

The project uses [Bootstrap](https://getbootstrap.com/) to style pages. You don't have to use Bootstrap and can roll your own styling. Bootstrap is great in that you can style for almost any screen size.

Use the remote button names in the LIRC configuration file as the ID for your buttons. As mentioned earlier, all buttons must be prefixed with "KEY_".

If you need to access another device from the current layout, prefix the button name with "ALT_device_" where device is the name of the device. 

For example a cable box  does not have volume controls but you want volume control of the TV on the cable box layout. The ID for the volume up button would be "ALT_tv_KEY_VOLUME_UP" in the cable.pug file.

##### Test Button Mapping

Open your browser's development tools console while viewing the site. Clicking on a button should show something along the line of "{result: "success"}" when the button is correctly mapped to an LIRC remote button. 

An error will show something like "{result: "unknown command: "KEY_DASH""}". That means there is no button named "KEY_DASH" in the LIRC configuration file for that device. Either update your template file or the LIRC configuration file.

### Macros
Macros allow you to sequence any number of commands. Define macros in default.json in the macro section. A macro is defined by naming the macro and giving it an array of command options. You can add a delay in milliseconds before executing the next command. This is handy for some devices that take some time to process before accepting more commands. For example, my TV needs to think a bit when the source button has been pressed before the TV will respond again to any other button.

Following is the sample macros included in the project:

```json
...
  "macros":{
    "watch_tv": [
      { "device": "tv",    "directive": "SEND_ONCE", "key": "KEY_POWER" },
      { "device": "cable", "directive": "SEND_ONCE", "key": "KEY_POWER" }
    ],
    "game_input":[
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_TV",     "delay": 1000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE", "delay": 2000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE", "delay": 2000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE", "delay": 2000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE", "delay": 2000 },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_SOURCE" },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_ENTER"}
    ],
    "toon_tv":[
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_TV" },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_3" },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_5" },
      { "device": "tv", "directive": "SEND_ONCE", "key": "KEY_ENTER" }
    ]
  }
...
```

#### Executing Macros
To execute a macro from your page, give the button ID the value of the macro name prefixed with 'MACRO_'. For example "MACRO_watch_tv", "MACRO_game_input", and "MACRO_toon_tv".

## Usage

### Development

The project by default uses nodemon to pick up your changes to automatically restart the server. You will notice the site runs a bit slow in this mode. This is really noticeable on Pi Zero as compared to the Pi 3. 

Start the server with:

```bash
sudo PORT=80 npm start
``` 

### Production

Running the server in production mode makes the site run way faster. The initial startup for each page will feel just as slow as development but all following requests will be much  faster. I could barely tell the difference of the site performance between the Pi Zero and the Pi 3.

Update package.json to use plain old Node.js and not nodemon. Update the scripts section in package.json.

Change
```json
  "scripts": {
    "start": "/opt/nodejs/bin/nodemon ./bin/www"
  },
```

To
```json
  "scripts": {
    "start": "node ./bin/www"
  },
``` 

Start the server with:

```bash
sudo PORT=80 NODE_ENV=production npm start
```

### Start on boot up

Sorry, this section is best up to searching the web as different operating systems have different setup and settings.

## Known Issues

If you discover any bugs, feel free to create an issue on GitHub fork and
send a pull request.


## Authors

* bbtinkerer (https://github.com/bbtinkerer/)


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
