 package com.adobe.phonegap.push;

import android.graphics.Bitmap;

/**
 * Created by John on 10/30/2017.
 */

public class NotifyModel {

  private String title;

  private String message;

  private  String from;

  private String quoteId;

  private String pickUpDate;

  private String pickUpTime;

  private String pickup;

  private String passenger;

  private String logoName;

  private Bitmap logoBitmap;


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
    return quoteId;
  }

  public void setQuoteId(String qouteId) {
    this.quoteId = qouteId;
  }

  public String getPickUpDate() {
    return pickUpDate;
  }

  public void setPickUpDate(String pickUpDate) {
    this.pickUpDate = pickUpDate;
  }

  public String getPickUpTime() {
    return pickUpTime;
  }

  public void setPickUpTime(String pickUpTime) {
    this.pickUpTime = pickUpTime;
  }

  public String getPickup() {
    return pickup;
  }

  public void setPickup(String pickup) {
    this.pickup = pickup;
  }

  public String getPassenger() {
    return passenger;
  }

  public void setPassenger(String pax) {
    this.passenger = pax;
  }

  public String getLogoName() {
    return logoName;
  }

  public void setLogoName(String logoName) {
    this.logoName = logoName;
  }

  public Bitmap getLogoBitmap() {
    return logoBitmap;
  }

  public void setLogoBitmap(Bitmap logoBitmap) {
    this.logoBitmap = logoBitmap;
  }

  public NotifyModel() {
  }

  public NotifyModel(String title, String message, String from, String quoteId, String pickUpDate, String pickUpTime, String pickup, String passenger, String logoName, Bitmap logoBitmap) {
    this.title = title;
    this.message = message;
    this.from = from;
    this.quoteId = quoteId;
    this.pickUpDate = pickUpDate;
    this.pickUpTime = pickUpTime;
    this.pickup = pickup;
    this.passenger = passenger;
    this.logoName = logoName;
    this.logoBitmap = logoBitmap;
  }
}
