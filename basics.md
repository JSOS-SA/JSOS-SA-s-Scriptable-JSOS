Basics

To create a widget you need to create a new ListWidget object:

```

var widget = new ListWidget()

```

Although this creates a widget object, this does not display anything. To display the currently empty widget

```

Script.setWidget(widget)

```

must be called. Typically, you will want to put this at the very end of your script.

Viewing the widget on your home screen

To see the widget, got to your home screen and add a new Scriptable widget. Now you need to select the correct script. You will see (depending on whether you have dark mode enabled or not) a white or black widget.

Viewing the widget inside the editor

To view the widget inside the editor, use the functions `presentSmall()`, `presentMedium()` and `presentLarge()`.

Example

```

if (config.runsInApp) widget.presentSmall()

else if (config.runsInWidget) Script.setWidget(widget)

```

Layout

Stacks

To add a new row or column to your widget you can call the function `addStack()`. The layout of the stack can be configured to be horizontal (row) or vertical (column). The default layout is horizontal.

Example

This example code creates a column with 5 rows in it.

```

let mainCol = widget.addStack()

mainCol.layoutVertically()

for (i=0; i<5; i++) {

  let row = mainCol.addStack()

  row.layoutHorizontally()

}

```

Content

Text

To add a text to a widget stack, use the function `addText(text: string)`. There's really not very much to it.

Attributes

You can modify the text by changing the objects attributes:

text

font

textColor

lineLimit

More...

Example

```

var text = row.addText('Hello World!')

text.font = Font.heading()

text.color = new Color('#ff0000') // red

```

Images

You can add images just like you would add a text. Just use the function addImage(image: Image).

Attributes

image

imageSize

cornerRadius

More...

Example

```

var image = Image.fromFile('file/path')

var imageInWidget = col.addImage(image)

imageInWidget.imageSize = new Size(200,200)

```

Spacing

If you want to align the objects you added to the widget, you can use `addSpacer(length: number)`. If you do not provide a number for the length, the spacer is sized dynamically. To center an element, use a spacer before and after it.

Examples

Right-aligned text

```

row.addSpacer()

row.addText('right')

```

Left-aligned text

```

row.addText('left')

row.addSpacer()

```

Center-aligned text

```

row.addSpacer()

row.addText('center')

row.addSpacer()

```

Style

Backgrounds

You can specify the background for the whole widget or just a specific stack.

Dedicated attributes

backgroundColor

backgroundImage

backgroundGradient

Examples

Color

```

widget.backgroundColor = new Color('#00ff00') // green

```

Image

```

widget.backgroundImage = Image.fromFile('file/path')

```

Gradient

```

let gradient = new LinearGradient()

gradient.colors = [new Color('#000000'), new Color('#ffffff')]

gradient.locations = [0,1]

widget.backgroundGradient = gradient

```

### /mnt/data/requests.md

# Beginners guide to requests

## Basic Code

This code performs a simple GET request for a specified url.

```javascript

const url = 'https://req.uest/url'

var req = new Request(url)

var result = await req.loadJSON()

```

Alternatively, if your API does not return the JSON format, you can use `load()` or `loadString()`.

## Method

You can use different [methods](https://developer.mozilla.org/de/docs/Web/HTTP/Methods) for your request depending on your needs. The common methods are `GET` and `POST`.

### Example

```javascript

req.method = 'GET'

```

## Headers

Headers are typically used to provide API keys, but they are not restricted to this.

### Example

```javascript

req.headers = {

  'api-key': '845a5e77f37404d6ffd41bccf9b926be0cf1e3431707'

}

```

### Note

Similarly, you can provide a body: `req.body = {...}`

## Response

If you want to check whether the request succeeded or not, you can check the response for error messages or codes (code 200 means success).

### Example

```javascript

console.log(req.response)

```

### Note

`response` has a value other than `undefined` only after the request is made.

## Parameters

Parameters are added via the URL. The first parameter is preceded by a question mark `?`. The following parameters are each preceded by an ampersand `&`. The format of the parameters is `parameter=value`.

### Example

```javascript

const url = 'https://req.uest/url?first%20parameter=abc&second%20parameter=876'

```

### Note

Parameters need to be URL encoded. That means that characters like spaces cannot be written as is. They need to be encoded (a space would be `%20`).

## Form data

Form data cannot be added to the URL itself. You can use different types of form data using one of the following functions (which are part of the [Request](https://docs.scriptable.app/request/) type):

```javascript

addFileDataToMultipart(data, mimeType, name, filename)

addFileToMultipart(filePath, name, filename)

addImageToMultipart(image, name, filename)

addParameterToMultipart(name, value)

```

### Example

```javascript

req.addParameterToMultipart('name', 'John Appleseed')

```

## Additional notes

- You should really read the API's documentation carefully before you perform requests.

- It also helps to read [Scriptable's documentation](https://docs.scriptable.app/).

- Please let me know if I forgot anything important.

## Other guides

- [A Beginner's Guide to Widgets](https://www.reddit.com/r/Scriptable/comments/lq1vb9/a_beginners_guide_to_widgets/)

- [A Beginner's Guide to Requests](https://www.reddit.com/r/Scriptable/comments/lpmda5/beginners_guide_to_requests/)

- [A Beginner's Guide to JSON](https://www.reddit.com/r/Scriptable/comments/lrroh2/a_beginners_guide_to_json/)

### /mnt/data/docs.md

# Alert¶

Presents an alert.

Use this to configure an alert presented modally or as a sheet. After

configuring the alert, call presentAlert() or presentSheet() to present the

alert. The two presentations methods will return a value which carries the

index of the action that was selected when fulfilled.

## title¶

Title displayed in the alert. Usually a short string.

    

    

    title: string

    

* * *

## message¶

Detailed message displayed in the alert.

    

    

    message: string

    

* * *

## -new Alert¶

Constructs a new alert.

    

    

    new Alert()

    

* * *

## -addAction¶

Adds an action to the alert.

    

    

    addAction(title: string)

    

Adds an action button to the alert. To check if an action was selected, you

should use the first parameter provided when the promise returned by

presentAlert() and presentSheet() is resolved.

### Parameters¶

**title**  

_string_  

Title of the action.

* * *

## -addDestructiveAction¶

Adds a destructive action to the alert.

    

    

    addDestructiveAction(title: string)

    

Destructive action titles have a red text color, signaling that the action may

modify or delete data.

### Parameters¶

**title**  

_string_  

Title of the action.

* * *

## -addCancelAction¶

Adds a cancel action to the alert.

    

    

    addCancelAction(title: string)

    

Adds a cancel action to the alert. When a cancel action is selected, the index

provided by presentAlert() or presentSheet() will always be -1. Please note

that when running on the iPad and presenting using presentSheet(), the action

will not be shown in the list of actions. The operation is cancelled by

tapping outside the sheet.

An alert can only contain a single cancel action. Attempting to add more

cancel actions will remove any previously added cancel actions.

### Parameters¶

**title**  

_string_  

Title of the action.

* * *

## -addTextField¶

Adds a text field prompting for user input.

    

    

    addTextField(placeholder: string, text: string): TextField

    

Adds a text field to the alert controller prompting for user input. Retrieve

the value for the text field using textFieldValue() and supply the index of

the text field. Indices for text fields are assigned in the same order as they

are added to the alert starting at 0.

Text fields are not supported when using the sheet presentation.

### Parameters¶

**placeholder**  

_string_  

Optional placeholder that will be displayed when the text field is empty.

**text**  

_string_  

Optional default value for the text field.

### Return value¶

_TextField_  

Text field added to the alert.

* * *

## -addSecureTextField¶

Adds a secure text field prompting for user input.

    

    

    addSecureTextField(placeholder: string, text: string): TextField

    

Adds a secure text field to the alert controller prompting for user input.

Values entered into a secure text field will be hidden behind dots. Retrieve

the value for the text field using textFieldValue() and supply the index of

the text field. Indices for text fields are assigned in the same order as they

are added to the alert starting at 0.

### Parameters¶

**placeholder**  

_string_  

Optional placeholder that will be displayed when the text field is empty.

**text**  

_string_  

Optional default value for the text field.

### Return value¶

_TextField_  

Text field added to the alert.

* * *

## -textFieldValue¶

Retrieves value of a text field.

    

    

    textFieldValue(index: number): string

    

Retrieves the value of a text field added using addTextField() or

addSecureTextField(). Indices for text fields are assigned in the same order

as they are added to the alert starting at 0.

### Parameters¶

**index**  

_number_  

Index of text field to retrieve for value.

### Return value¶

_string_  

Value of the text field at the specified index.

* * *

## -present¶

Presents the alert modally.

    

    

    present(): Promise<number>

    

This is a shorthand for presentAlert().

### Return value¶

_Promise_  

A promise carrying the selected action index when fulfilled.

* * *

## -presentAlert¶

Presents the alert modally.

    

    

    presentAlert(): Promise<number>

    

### Return value¶

_Promise_  

A promise carrying the selected action index when fulfilled.

* * *

## -presentSheet¶

Presents the alert as a sheet.

    

    

    presentSheet(): Promise<number>

    

### Return value¶

_Promise_  

A promise carrying the selected action index when fulfilled.

* * *

© 2023 Simon B. Støvring. All rights reserved.

[Press Kit](https://scriptable.app/scriptable-press-kit.zip)   [Privacy

Policy](https://scriptable.app/privacy-policy/)   [Contact](/cdn-cgi/l/email-

protection#deb3bfb7b29eadbdacb7aeaabfbcb2bbf0bfaeae)

powered by [MkDocs](https://www.mkdocs.org) and [Material for

MkDocs](https://squidfunk.github.io/mkdocs-material/)

[ ](https://twitter.com/scriptableapp "twitter.com")

---

# args¶

Arguments passed to the script.

Arguments are passed to the script when the script is executed from a share

sheet. You can specify the types of arguments a script supports from the

script settings.

## length¶

Number of arguments supplied by a share sheet.

_Read-only._

Deprecated in version 1.3. Instead of relying on this property, take the

length of the array containing the data type you are interested in.

The number of arguments passed to the script from the share seeht.

    

    

    length: number

    

* * *

## all¶

All arguments supplied by a share sheet.

_Read-only._

Deprecated in version 1.3. Instead of relying on this property, access the

array containing the data type you are interested in.

All arguments supplied by the share sheet.

    

    

    all: [any]

    

* * *

## plainTexts¶

Plain texts supplied by a share sheet or a shortcut action.

_Read-only._

All plain texts passed to the script from a share sheet or a shortcut action.

If you have enabled "Text" as a share sheet input from the script settings,

the script can be run from any share sheet throughout the system that shares

plain text.

    

    

    plainTexts: [string]

    

* * *

## urls¶

URLs supplied by a share sheet or a shortcut action.

_Read-only._

All URLs passed to the script from a share sheet or a shortcut action.

If you have enabled "URLs" as a share sheet input from the script settings,

the script can be run from any share sheet throughout the system that shares

URLs.

    

    

    urls: [string]

    

* * *

## fileURLs¶

File URLs supplied by a share sheet or a shortcut action.

_Read-only._

All file URLs passed to the script from a share sheet or a shortcut action.

If you have enabled "File URLs" as a share sheet input from the script

settings, the script can be run from any share sheet throughout the system

that shares URLs pointing to a file.

When large files are passed from a share sheet or a shortcut action, the

system may terminate the process due to memory constraints. In that case, you

should enable "Run in App" in the script settings or in the shortcut.

    

    

    fileURLs: [string]

    

* * *

## images¶

Images supplied by a share sheet or a shortcut action.

_Read-only._

All images passed to the script from a share sheet or a shortcut action.

If you have enabled "Images" as a share sheet input from the script settings,

the script can be run from any share sheet throughout the system that shares

images.

When large images are passed from a share sheet or a shortcut action, the

system may terminate the process due to memory constraints. In that case, you

should enable "Run in App" in the script settings or in the shortcut.

    

    

    images: [Image]

    

* * *

## queryParameters¶

Query parameters from a URL scheme.

_Read-only._

Query parameters are supplied to a script when running it from a URL scheme.

See the documentation on Scriptables URL schems for more information.

    

    

    queryParameters: {string: string}

    

* * *

## siriShortcutArguments¶

Arguments passed from a Siri Shortcut.

_Read-only._

Deprecated in version 1.4. Instead of using args.shortcutArguments, pass an

input parameter to the shortcut action using the Shortcuts app and read the

parameter using `args.shortcutParameter`.

When creating a Siri Shortcut in Scriptable, you can define arguments that are

passed to the script when the shortcut is run. This lets you differentiate the

behavior of a script based on some predefiend arguments.

For example, a script that checks the wather may expect an argument with the

key "city". When creating a Siri Shortcut for the script, the argument should

be passed with the value containing the name of the city to check the weather

for.

    

    

    siriShortcutArguments: {string: string}

    

* * *

## shortcutParameter¶

Parameter passed to a Shortcut.

_Read-only._

When creating a shortcut using the Shortcuts app, you can pass an input

parameter that can be read in your script using `args.shortcutParameter`.

This parameter can be any text, list, dictionary or file and will be exposed

in your script using the appropriate type. When passing a file, the "Run

Script" action will attempt to read the file as JSON or a plain text. If the

file cannot be read as JSON or a plain text, a path to the file will be passed

as the input parameter.

    

    

    shortcutParameter: any

    

* * *

## widgetParameter¶

Parameter passed to a widget.

_Read-only._

When creating a widget on the Home screen, you can define a parameter that can

be read in your script using `args.widgetParameter`.

The parameter can be used to differentiate the behavior of multiple widgets.

    

    

    widgetParameter: any

    

* * *

## notification¶

Notification being handled by the script.

_Read-only._

The notification that a script is being run in or the application was opened

from.

The notification contains all information that was set when the notification

was originally scheduled, including the `userInfo` property which can be used

to contain custom data that might be relevant when running the script.

    

    

    notification: Notification

    

* * *

© 2023 Simon B. Støvring. All rights reserved.

[Press Kit](https://scriptable.app/scriptable-press-kit.zip)   [Privacy

Policy](https://scriptable.app/privacy-policy/)   [Contact](/cdn-cgi/l/email-

protection#660b070f0a261505140f161207040a0348071616)

powered by [MkDocs](https://www.mkdocs.org) and [Material for

MkDocs](https://squidfunk.github.io/mkdocs-material/)

[ ](https://twitter.com/scriptableapp "twitter.com")

---

# Calendar¶

Holds reminders and events.

Use the Calendar type to get a specific calendar. The calendar is used with

the Reminder and CalendarEvent types when fetching reminders or events from a

specific calendar or when inserting into a calendar. If you are fetching

reminders or events from all calendars, you do not need to pass the calendars

when performing the fetch with the Reminder or CalendarEvent types.

## identifier¶

Calendar identifier.

_Read-only._

    

    

    identifier: string

    

* * *

## title¶

Title of calendar.

    

    

    title: string

    

* * *

## isSubscribed¶

Whether the calendar is a subscribed calendar.

_Read-only._

    

    

    isSubscribed: bool

    

* * *

## allowsContentModifications¶

Indicates whether items can be added, edited, and deleted in the calendar.

_Read-only._

    

    

    allowsContentModifications: bool

    

* * *

## color¶

Color of calendar.

    

    

    color: Color

    

* * *

## -supportsAvailability¶

Checks if the calendar supports availability.

    

    

    supportsAvailability(availability: string): bool

    

The following values are supported:

  * busy

  * free

  * tentative

  * unavailable

Not all calendars support all of these availabilities and some calendars may

not support availability at all. Use this function to check if the calendar

supports a specific availability.

### Parameters¶

**availability**  

_string_  

Availability to che
