export default class Singleton {
	constructor(classConstructor) {
		if (classConstructor._instance) {
			return classConstructor._instance;
		}
		classConstructor._instance = this;
	}
}
