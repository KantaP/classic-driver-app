package com.adobe.phonegap.push;

import android.content.Context;



import java.util.ArrayList;

import voova.no.classicdriverapp.newgen.Contextor;

/**
 * Created by John on 10/30/2017.
 */

public class NotifyListManager {

  private static NotifyListManager instance;
  public ArrayList<NotifyModel> dao = new ArrayList<NotifyModel>();

  public static NotifyListManager getInstance() {
    if (instance == null)
      instance = new NotifyListManager();
    return instance;
  }

  private Context mContext;

  private NotifyListManager() {
    mContext = Contextor.getInstance().getContext();
  }

  public void setDao(NotifyModel dao){
      this.dao.add(dao);
  }

  public NotifyModel getDao(int idx){
    return this.dao.get(idx);
  }

  public int getSize(){
    return dao.size();
  }

  public void add(NotifyModel db){

    dao.add(db);

  }

  public void remove(){
    dao.clear();
  }



}
