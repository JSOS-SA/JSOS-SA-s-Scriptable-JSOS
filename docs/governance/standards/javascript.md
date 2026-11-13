# JavaScript and Scriptable Runtime Standard

**Rules:** SCR-RUN-001 through SCR-RUN-004.

## Language level

ECMAScript 2015 is the baseline. Newer syntax and built-ins require explicit runtime evidence and a recorded compatibility assessment.

TypeScript target and library declarations are separate settings. Type definitions are not proof that an API exists in Scriptable.

## Host boundaries

Main-runtime code must use Scriptable's documented Host APIs. Do not assume browser DOM globals, Node.js modules, process, Buffer, or filesystem APIs.

WebView code may use browser APIs only inside the WebView. Any bridge between WebView and main runtime must validate messages and data.

## Modules and dependencies

Use Scriptable module loading and project-approved module boundaries. Do not import Node packages or browser libraries into the main runtime without dependency review and device proof.

## Context declarations

Every script or module documents whether it supports in-app, Widget, WebView, Shortcuts/Siri, Share Sheet, Notifications, or URL Scheme execution. Untested contexts remain Not Verified.
