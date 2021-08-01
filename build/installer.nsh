!include MUI2.nsh
!include nsDialogs.nsh

!define GC_INSTALLER "helloworld.exe"

; The result of whether we should install drivers or not
var InstallType

Page custom InstTypePageCreate InstTypePageLeave

Function InstTypePageCreate
!insertmacro MUI_HEADER_TEXT "Slippi Launcher Installation" ""
nsDialogs::Create 1018
Pop $0
${NSD_CreateRadioButton} 0 50u 100% 10u "Also install GameCube adaptor drivers (optional)"
pop $1
${NSD_CreateRadioButton} 0 70u 100% 10u "Only install Slippi Launcher"
pop $2
${If} $InstallType == SKIP
    ${NSD_Check} $2 ; Select skip
${Else}
    ${NSD_Check} $1 ; Select install drivers by default
${EndIf}
${NSD_CreateLabel} 0 0 100% 30u "GameCube adaptor drivers allow you to use your GameCube controllers on PC using a compatible adapter. Would you like to install the drivers along with Slippi Launcher?"
pop $3
nsDialogs::Show
FunctionEnd

Function InstTypePageLeave
${NSD_GetState} $1 $0
${If} $0 = ${BST_CHECKED}
  ; Install was selected
  StrCpy $InstallType INSTALL
${Else}
  ${NSD_GetState} $2 $0
  ${If} $0 = ${BST_CHECKED}
    ; Skip was selected
    StrCpy $InstallType SKIP
  ${Else}
    ; Nothing was selected
  ${EndIf}
${EndIf}
FunctionEnd

!macro customInstall
  ; Check if we should also install the GC drivers
  ${If} $InstallType == INSTALL
    ; Automatically run gamecube adapter driver installer
    File /oname=$PLUGINSDIR\${GC_INSTALLER} "${BUILD_RESOURCES_DIR}\${GC_INSTALLER}"
    ExecShellWait "" "$PLUGINSDIR\${GC_INSTALLER}" SW_HIDE
  ${EndIf}
!macroend