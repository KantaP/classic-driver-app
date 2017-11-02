package com.adobe.phonegap.push;

import android.graphics.Bitmap;

/**
 * Created by John on 10/30/2017.
 */

public class NotifyModel {

  private String title;

  private String message;

  private  String from;

  private String qouteId;

  private String pickUpDate;

  private String route;

  private String place;

  private String channel;

  private String logoName;

  private Bitmap logoBitmap;



  public Bitmap getLogoBitmap() {
    return logoBitmap;
  }

  public void setLogoBitmap(Bitmap logoBitmap) {
    this.logoBitmap = logoBitmap;
  }


  public String getLogoName() {
    return logoName;
  }

  public void setLogoName(String logoName) {
    this.logoName = logoName;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getFrom() {
    return from;
  }

  public void setFrom(String from) {
    this.from = from;
  }

  public String getQuoteId() {
    return qouteId;
  }

  public void setQuoteId(String qouteId) {
    this.qouteId = qouteId;
  }

  public String getPickUpDate() {
    return pickUpDate;
  }

  public void setPickUpDate(String name) {
    this.pickUpDate = name;
  }

  public String getPickUpTime() {
    return route;
  }

  public void setPickUpTime(String route) {
    this.route = route;
  }

  public String getPassengerNumber() {
    return place;
  }

  public void setPassengerNumber(String place) {
    this.place = place;
  }

  public String getChannel() {
    return channel;
  }

  public void setChannel(String channel) {
    this.channel = channel;
  }

  public NotifyModel(){

  }

  public NotifyModel(String title, String message, String from, String qouteId, String pickUpDate, String route, String place, String channel, String logoName, Bitmap logoBitmap) {
    this.title = title;
    this.message = message;
    this.from = from;
    this.qouteId = qouteId;
    this.pickUpDate = pickUpDate;
    this.route = route;
    this.place = place;
    this.channel = channel;
    this.logoName = logoName;
    this.logoBitmap = logoBitmap;
  }
}
