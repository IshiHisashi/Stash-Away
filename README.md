# Stash Away

<p align=center>
  <img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/logo.svg alt='Logo | Stash Away'>
</p>

<p align=center>
  <p><strong>An app which provides remote rental storage service to help people suffering from small living space due to the surge in the housing market.</strong></p>
</p>
<p>Stash Away offers convenient pickup and delivery of your items, along with sophisticated inventory management, making it easy to store and track your belongings remotely.</p>

## Demo
### Video
<p>(Please click below thumbnail then you'll be navigated to youtube link)</p>

[![](https://img.youtube.com/vi/HOvOjbfgq40/0.jpg)](https://www.youtube.com/watch?v=HOvOjbfgq40)

### Screenshots(Desktop)
<table>
  <thead>
    <th>Select Location</th>
    <th>Add Items</th>
    <th>Order Tracing</th>
    <th>View Storage</th>
    <th>Driver's end</th>
  </thead>
  <tr>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/SelectLocation_ReadMe_d.png width=150/></td>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/AddItem_ReadMe_d.png width=150/></td>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/OrderTracing_ReadMe_d.png width=150/></td>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/ViewStorage_ReadMe_d.png width=150/></td>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/Driver_ReadMe_d.png width=150/></td>
  </tr>
</table>

### Screenshots(Mobile)
<table>
  <thead>
    <th>Select Location</th>
    <th>Add Items</th>
    <th>Order Tracing</th>
    <th>View Storage</th>
    <th>Driver's end</th>
  </thead>
  <tr>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/SelectLocation_ReadMe_m.png width=150/></td>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/AddItem_ReadMe_m.png width=150/></td>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/OrderTracing_ReadMe_m.png width=150/></td>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/ViewStorage_ReadMe_m.png width=150/></td>
    <td valign="top"><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/Driver_ReadMe_m.png width=150/></td>
  </tr>
</table>

## Directory Structure
<table>
  <thead>
    <th>Directory</th>
    <th>Description</th>
  </thead>
  <tr>
    <td><a target="_blank" href=https://github.com/IshiHisashi/Stash-Away/tree/main/UserEnd>UserEnd</td>
    <td>This facilitates interface for users such as main page, booking process, storage management and retrieval process</td>
  </tr>
  <tr>
    <td><a target="_blank" href=https://github.com/IshiHisashi/Stash-Away/tree/main/DriverEnd>DriverEnd</td>
    <td>This represents task management function for drivers to receive request from users and revert update back to them. </td>
  </tr>
</table>

## How to Use the app
### User end
<p>You can access from <a target="_blank" href=https://stash-away.vercel.app/UserEnd/homepage/main.html>Here</a></p>
<p>Then, please create your account or try this sample account</p>
<pre>
  <code>
    Email : stashaway.wmddproject@gmail.com
    Password : samplepass
  </code>
</pre>


### Driver end
<p>You can access from <a target="_blank" href=https://stash-away.vercel.app/DriverEnd/driver.html>Here</a></p>


## Teck Stack
<p>This application is nicely developed by making the most of firebase and a geolocation API</p>
<h3>Frontend</h3>
<p> <img style="margin-right: 300;" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original-wordmark.svg" alt="css3" width="40" height="40"/>  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="40" height="40"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/></p>
<h3>Backend</h3>
  <p><img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" alt="firebase" width="40" height="40"/><span>   =>   Database, Data Storage, Authentication</span></p>
<h3>API</h3>
  <table>
    <thead>
      <th>API</th>
      <th>Desctiprion</th>
    </thead>
    <tr>
      <td>Tomtom API</td>
      <td>To use map, geo coding and calculation of ETA (Estimate time of arrival)</td>
    </tr>
    <tr>
      <td>Web API for Camera</td>
      <td>To capture image and upload pictures from device</td>
    </tr>
    <tr>
      <td>Web API for Notification</td>
      <td>To send notification (when driver departs for pickup/delivery)</td>
    </tr>
  </table>

## Authors
<table>
  <thead>
    <th></th>
    <th>Developer</th>
    <th>Git account</th>
    <th>Role</th>
  </thead>
  <tr>
    <td><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/Ishi_prof.png height=50 width=50></td>
    <td>Hisashi Ishihara</td>
    <td><a target="_blank" href=https://github.com/IshiHisashi>@IshiHisashi</td>
      <td>Handling database | Built booking & storage management framework</td>
  </tr>
  <tr>
    <td><img  target="_blank"src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/Prathibha_prof.png height=50></td>
    <td>Pratibha Wijetunga</td>
    <td><a target="_blank" href=https://github.com/shehani-wijetunga>@shehani-wijetunga</td>
    <td>Camera & upload image from device for adding-item feature | Built home page</td>
  </tr>
  <tr>
    <td><img  target="_blank"src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/Sacha_prof.png height=50></td>
    <td>Sachi Asano</td>
    <td><a href=https://github.com/c-est-sa>@c-est-sa</td>
    <td> Authentication | Notification | Built driver's end and order tracing structure </td>  
  </tr>
  <tr>
    <td><img src=https://github.com/IshiHisashi/Stash-Away/blob/main/UserEnd/images/Aki_prof.png height=50></td>
    <td>Akifumi Hayashi</td>
    <td><a target="_blank" href=https://github.com/Akiodesukedo>@Akiodesukedo</td>
    <td>Select Geo Location | Calculation of ETA | Built order-confirmation page </td>  
  </tr>
</table>

