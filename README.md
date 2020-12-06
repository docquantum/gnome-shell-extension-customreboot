# Custom Reboot GNOME Shell Extension
Inspired by and based on [patriziobruno/grubreboot-gnome-shell-extension](https://github.com/patriziobruno/grubreboot-gnome-shell-extension).

---

| Bootloader   | Supported |
| ------------ | --------- |
| systemd-boot | Yes       |
| GRUB         | Planned   |

A gnome-shell extension to add a "Custom Restart..." option to the shell system panel that allows you to choose what OS you want to boot into, after which it triggers the typical end session dialog for restart.

This extension needs permissions for gnome-shell to read your `/boot` partition, please verify your Linux distribution documentation.


## Systemd-boot

It's able to set the one-shot default using [`bootctl set-oneshot ID`](https://www.freedesktop.org/software/systemd/man/bootctl.html#set-default%20ID).

The presented options are parsed from `bootctl list`.

When you select the operating system to reboot into, you'll be required to input your password because of required permissions to run `bootctl` which set EFI variables.

## GRUB

Plan to use similar logic to that used by the original grubreboot-gnome-shell-extension.

## Caveats

I've only tested this on Arch Linux running gnome 3.38 and systemd-boot. Please let me know if you run into issues on other distros, bootloaders, and GNOME shell versions.

Pull requests welcome!
