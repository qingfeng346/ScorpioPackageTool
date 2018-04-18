package com.scorpio.main;

import java.io.File;

import com.dd.plist.NSDictionary;
import com.dd.plist.PropertyListParser;
import com.google.gson.Gson;

public class Launch {
	public static void main(String[] args) {
		try {
			for (String arg : args) {
				System.out.println(arg);
			}
			File directory = new File("");
			System.out.println(directory.getAbsolutePath());
			File file = new File(directory.getAbsolutePath() + "/Info.plist");
			NSDictionary rootDict = (NSDictionary)PropertyListParser.parse(file);
			//String str = rootDict.toXMLPropertyList();
			//System.out.println(str);
			//System.out.println(new Gson().toJson(rootDict));
			String name = rootDict.objectForKey("CFBundleDisplayName").toString();
			int a = 0;
			System.out.println(name);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
