# @taichuy/plugin-login-lite

**English** | [简体中文](./README_CN.md)

Custom Login Page Configuration Plugin for NocoBase (Lite Version).
This plugin allows you to customize the appearance and behavior of the NocoBase login page directly from the admin panel.

## Usage

1.  **Enable Plugin**: Go to the NocoBase Plugin Manager, search for `@taichuy/plugin-login-lite` and enable it.
2.  **Access Configuration**: After enabling the plugin, refresh the page, find and click the "Login Configuration" menu in the system settings or sidebar.
3.  **Add Configuration**: Click the "Add" button and choose to create a "Home configuration".
4.  **Apply Configuration**: In the configuration list, toggle the "Enable" switch to apply the configuration. Only one home configuration can be enabled at a time.

## Preview

The plugin supports multiple languages. These screenshots show the Chinese interface, but the UI will adapt to your selected language.

<img src="https://raw.githubusercontent.com/taichuy/docs/main/docs/nocobase/plugin-login-lite.assets/image-20251225111506531.png" alt="Preview" style="zoom: 33%;" />

Admin Configuration:

<img src="https://raw.githubusercontent.com/taichuy/docs/main/docs/nocobase/plugin-login-lite.assets/image-20251225111323992.png" alt="Admin Configuration" style="zoom: 33%;" />

## Configuration Options

The table below details the functions of each item in the configuration form:

| Field Name | Type | Description | Default Value |
| :--- | :--- | :--- | :--- |
| **Title** | Input | The name of this configuration, used only for internal management. | - |
| **Description** | Text Area | A brief description of this configuration. | - |
| **Use system name** | Radio | Whether to directly display the application name from system settings. | Yes |
| **Custom system name** | Input | Custom display name for the system. Appears only when "Use system name" is set to "No". | - |
| **Left side content** | Radio | Choose the content type for the left area: Image, HTML Embed, or Webpage Embed. | Image |
| **Left side image URL** | Input | The URL of the image to display on the left. Appears only when "Image" is selected. | Bing Daily Wallpaper |
| **Webpage embed URL** | Input | The URL of the webpage to embed (iframe). Appears only when "Webpage Embed" is selected. | - |
| **HTML embed code** | Text Area | Custom HTML code to render on the left. Appears only when "HTML Embed" is selected. | - |
| **Open login methods** | Checkbox | Allowed login methods for users (e.g., Password Login). | Password Login |
| **ICP filing info** | Markdown | ICP filing or other footer information, supports Markdown. | Modified by taichuy |
| **Background color** | Color Picker | Overall background color of the login page. | #000 |
| **Font color** | Color Picker | Color of the main text on the page. | #fff |
| **Form theme color** | Color Picker | Background color of the login form container. | rgba(255,255,255,0.12) |
| **Form text color** | Color Picker | Color of the text inside the login form. | #fff |
| **Button color** | Color Picker | Background color of the login button. | rgba(255,255,255,0.2) |
| **Button text color** | Color Picker | Color of the text on the login button. | #fff |
| **Enable** | Switch | Whether to activate the current configuration immediately. | Yes |

## More Features (Pro Version)

If you need more advanced features, such as **WeChat ecosystem integration (WeChat Official Account QR code login, WeChat Mini Program unified user authentication)**, please contact us to purchase the paid plugin. Delivery and pricing are as follows:

| License Type | Price | Benefits Included | Suitable Scenarios |
| :--- | :--- | :--- | :--- |
| **Package License** | $45 | 1. Plugin package for a specific version<br>2. One-time purchase, permanent usage license<br>3. Basic installation guidance | Stable production deployment, no frequent updates required |
| **Package + Source** | $90/1st Year | 1. Includes all benefits of Package License<br>2. One year of access to GitHub private repository<br>3. Continuous update support for one year | Need to follow NocoBase upgrades or deep customization |
| **Source Renewal** | $45/Year | 1. Continue GitHub private repository access after renewal<br>2. Continuous update support during the renewal period | Existing package users continuing to get updates |

For more details: [Taichuy's NocoBase Plugins](https://docs.taichuy.com/en-US/nocobase)

## License

This project is licensed under the [AGPL-3.0](./LICENSE-AGPL.txt).

## Taichu y Team's NocoBase Plugins

---

Our Taichu y team has accumulated a series of practical plugins during the in-depth use of NocoBase to develop internal systems.

Adhering to the spirit of open source, we share some simple and practical plugins for free. At the same time, to balance R&D costs, we charge for some plugins with complex functions and high development investment to support continuous development.

### 📞 Contact Us

**GitHub Organization**: [https://github.com/taichuy](https://github.com/taichuy)  
**Technical Consultation**: Follow the WeChat Official Account `taichuy-com` or email `taichu2021@gmail.com`  
**Get Plugin**: Follow the official account and reply with the keyword `太初y的nocobase插件` to get the pre-packaged plugin.

**Official Account**:

<img src="https://raw.githubusercontent.com/taichuy/docs/main/public/wechat_office_taichuy.jpg" alt="Taichuy Official Account" style="zoom: 33%;" />
