package JavaInfo;

public class Start {
	public static void main(String[] args) {
		if (args.length <= 0) {
			for (Object key : System.getProperties().keySet()) {
				System.out.println(key + " = " + System.getProperty(key.toString()));
			}
			return;
		}
		System.out.println(System.getProperty(args[0]));
	}
}
