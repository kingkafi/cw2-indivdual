const API = 'https://kafi-projectcw2.herokuapp.com'

let webstore = new Vue({
  el: "#app",
  data: {
    lessons: [],
    sortBy: "topic",
    sortOrder: "asc",
    activePage: "lessons",
    name: "",
    phone: "",
    targetLesson: null,
    searchTerm: "",
  },
  methods: {
    // switches from main page to payment page
    togglePage() {
      if (this.activePage === "lessons") {
        this.activePage = "confirm";
      } else {
        this.activePage = "lessons";
      }
    },
    // to purchase a lesson
    purchaseLesson(lesson) {
      this.targetLesson = lesson;
      this.togglePage();
    },
    // to cancel it
    cancelLesson() {
      this.targetLesson = null;
      this.togglePage();
    },
    // confirm order
    async confirm() {
      await fetch(`${API}/order`, {
        method: "POST",
        body: JSON.stringify({
          name: this.name,   // sends a order data to the order collection  with post method
          phone: this.phone,
          lesson_id: this.targetLesson._id,
          spaces: 1,
        }),
      }).then(async (response) => {
        let data = await response.json();

        await fetch(`${API}/lesson/${this.targetLesson._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            space: 1,
          }),
        }).then(() => {
          Swal.fire({
            title: "Confirmed!", // this when you click the confirm button sending the data to the collection
            text: `${this.name} Thank you. We will contact you at ${this.phone}. ${data.msg}`,
            icon: "success",
            confirmButtonText: "Cool",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        });
      });
    },
    // this searches for lessons throught the get method
    async search() {
      let response = await fetch(`${API}/search/${this.searchTerm}`, {
        method: "GET",
      });
      let data = await response.json();
      this.lessons = data;

      console.log("data: ", data);
    },
    //this will retrieve lessons the get method
    async getLessons() {
      let response = await fetch(`${API}/lesson`, {
        method: "GET",
      });
      let data = await response.json();
      this.lessons = data;
    }
  },
  computed: {
    sortedLessons: function () {
      // if sorting in ascending order
      if (this.sortOrder === "asc") {
        return this.lessons.sort((a, b) =>
          a[this.sortBy] > b[this.sortBy]
            ? 1
            : b[this.sortBy] > a[this.sortBy]
            ? -1
            : 0
        );
      }
      // if sorting in descending order
      return this.lessons.sort((a, b) =>
        a[this.sortBy] > b[this.sortBy]
          ? -1
          : b[this.sortBy] > a[this.sortBy]
          ? 1
          : 0
      );
    },
    canCheckout: function () {
      let isNameCorrect = /^[a-zA-Z\s]*$/.test(this.name); // regex is used to check if name contains letters only
      let isPhoneCorrect = /^[0-9]+$/.test(this.phone) && this.phone.length > 11; // regex is used to check if phone contains number only AND it has more than 11 digits
      return isNameCorrect && isPhoneCorrect;
    },
  },
  mounted() {
    // retrieves lessons
    this.getLessons()
  },
  watch: {
    // constant updates on the search bar like google
    searchTerm() {
      if(this.searchTerm) {
        this.search();
      } else {
        this.getLessons();
      }
    },
  },
});
