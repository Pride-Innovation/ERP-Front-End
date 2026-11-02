# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Handheld scanner (PDA) setup

The asset labels (QR codes and barcodes) are scanned with an Android PDA that has a built-in scan
engine. The PDA does not search on its own: it is **paired with a computer browser**, and every
label it scans appears in that computer's search box, which then opens the asset. If a form field is
selected on the computer (for example an asset's engraved number), the scan goes into that field
instead.

- **In production** the PDA and the computer both use the server's address. No cable, no extra
  software: do [Part 1](#part-1--set-up-a-new-pda-once-per-device) once per PDA, then
  [Part 4](#part-4--pair-and-scan).
- **In development**, where the app runs on a Windows PC at `localhost`, the PDA reaches the PC over
  USB. Do all four parts.

### Part 1 — Set up a new PDA (once per device)

Open the PDA's **scanner settings** app and set:

| Setting | Value | Why |
|---|---|---|
| Scan switch | **On** | |
| Output mode | **Keyboard mode** | Sends each scan as key presses into the page |
| Terminator | **Enter Key** | Not the combined "Enter/Tab" options; the extra Tab moves the cursor |
| Add prefix / Add suffix | empty | |
| Filter char / Remove char | empty (see the check below) | |
| Delete invisible char | **On** | |
| Decode | **UTF-8** | |
| Handle button | **On** | The pistol trigger scans |
| Continuous scan | **Off** | One trigger press, one scan |
| Multiple scan | **Off** | |
| Do not repeat | **Off** | Otherwise the same label cannot be scanned twice in a row |
| Show data details | **Off** | Stops a pop-up after each scan |
| Camera app switch | **Off** | The built-in scan engine is used, not the camera |
| Vibrate / LED / sound | your preference | |

**Check it:** open any text field on the PDA (Notes, or Chrome's address bar) and scan a label. The
engraved number, e.g. `PBL-2026-LPT07`, should appear at once, followed by a new line. If it does
not:

| You see | Fix |
|---|---|
| Asterisks around it, `*PBL-…*` | The label is Code 39. Put `*` in **Remove char** |
| An extra `]Q1` or a letter at the front | A code-ID prefix is on; clear **Add prefix** |
| No new line after it | Set **Terminator** to **Enter Key** |
| Nothing at all | Check **Scan switch** and **Handle button** are on |

### Part 2 — Prepare a new Windows PC (development only, once per PC)

1. **Install adb** (Android's USB tool). Either:
   - in PowerShell: `winget install Google.PlatformTools`, then **open a new terminal**; or
   - download *SDK Platform-Tools for Windows* from
     <https://developer.android.com/tools/releases/platform-tools>, unzip it (e.g. to
     `C:\platform-tools`) and add that folder to `PATH`, or run the commands from inside it as
     `.\adb`.

   Check it: `adb version`.

2. **Turn on USB debugging on the PDA** (once per PDA):
   - Settings → About phone → tap **Build number** seven times, until it says you are a developer.
   - Settings → System → **Developer options** → turn on **USB debugging**.

3. **Connect the PDA with a USB data cable.** Some charging-only cables carry no data. Accept the
   **"Allow USB debugging?"** prompt on the PDA and tick *Always allow from this computer*. If no
   prompt appears, pull down the notification shade and set the USB mode to **File transfer**.

4. **Check the connection:**
   ```
   adb devices
   ```
   You should see one line ending in `device`. `unauthorized` means the prompt on the PDA has not
   been accepted yet.

### Part 3 — Connect the PDA to the PC (development, every session)

With the backend (port `7777`) and `npm start` (port `3000`) running on the PC:

```
adb reverse tcp:3000 tcp:3000
adb reverse tcp:7777 tcp:7777
```

The PDA's `localhost:3000` and `localhost:7777` now lead to the PC, so **no `.env` changes are
needed**: the PDA uses the same addresses the PC does. `adb reverse --list` shows what is active.

The forwarding is lost when the cable is unplugged or the PDA restarts. Run the two commands again.

### Part 4 — Pair and scan

1. **On the computer**, sign in and click the **scanner button** beside the search box at the top of
   the page. It shows a pairing QR code and the same code as text (e.g. `K7Q4-M2XA`). The code works
   **once** and expires after **5 minutes**; click *Show a new code* if it runs out.
2. **On the PDA**, open Chrome and go to the scanner page:
   - development: `http://localhost:3000/scan`
   - production: `https://<server address>/scan`

   No login is needed on the PDA. Bookmarking the page, or adding it to the home screen, saves typing
   it next time.
3. **Scan the QR code on the computer screen.** If the scanner cannot read it off the screen, tap
   *Type the code instead* and type the code shown. The computer says *Scanner connected* and its
   scanner button turns green; the PDA says *Paired with &lt;name&gt;'s computer*.
4. **Scan asset labels.** Each one appears in the computer's search box and the asset opens. The PDA
   lists each scan with a tick when it was sent.

The pairing ends when you click **Disconnect** on the computer (the green scanner button), tap
**Unpair this scanner** on the PDA, sign out on the computer, or after **8 hours**. A server restart
also ends it. The PDA says *disconnected* on its next scan; pair again from step 1.

### Troubleshooting

| Problem | Likely cause |
|---|---|
| PDA page will not load (development) | Forwarding lost: run the two `adb reverse` commands again and check `adb devices` |
| PDA shows *The computer is not connected* | The app is not open on the computer, or the computer lost its connection. Reload the page there and pair again if needed |
| PDA says *disconnected* | The pairing ended (see above). Pair again |
| Scans land in the PDA's own text field but nothing reaches the computer | The PDA is not on the `/scan` page, or is not paired yet |
| Wrong characters arrive (`*`, an extra digit, a prefix) | Scanner settings; see the check in Part 1 |
| A scan fills a form field instead of searching | A field on the computer has the cursor. Click elsewhere on the page to search instead |

A scanner plugged straight into the computer (a USB or Bluetooth "keyboard" scanner) needs none of
this: scanning on any page fills the search box and searches.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
