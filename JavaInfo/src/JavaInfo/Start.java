package JavaInfo;

public class Start {
	public static void main(String[] args) {
		if (args.length <= 0) {
			return;
		}
		System.out.println(System.getProperty(args[0]));
	}
}
