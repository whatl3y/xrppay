<template lang="pug">
  nav.navbar.navbar-expand-lg.navbar-light.bg-light
    router-link.navbar-brand(to='/') xrppay
    button.navbar-toggler(type='button', data-toggle='collapse', data-target='#navbarSupportedContent', aria-controls='navbarSupportedContent', aria-expanded='false', aria-label='Toggle navigation')
      span.navbar-toggler-icon
    div#navbarSupportedContent.collapse.navbar-collapse
      ul.navbar-nav.mr-auto
      //-   li.nav-item.active
      //-     router-link.nav-link(to='/')
      //-       | Home 
      //-       span.sr-only (current)
      //-   li.nav-item
      //-     a.nav-link(href='#') Link
      //-   li.nav-item.dropdown
      //-     a#navbarDropdown.nav-link.dropdown-toggle(href='#', role='button', data-toggle='dropdown', aria-haspopup='true', aria-expanded='false')
      //-       | Dropdown
      //-     div.dropdown-menu(aria-labelledby='navbarDropdown')
      //-       a.dropdown-item(href='#') Action
      //-       a.dropdown-item(href='#') Another action
      //-       .dropdown-divider
      //-       a.dropdown-item(href='#') Something else here
      //-   li.nav-item
      //-     a.nav-link.disabled(href='#') Disabled
      //- form.form-inline.my-2.my-lg-0
      //-   input.form-control.mr-sm-2(type='search', placeholder='Search', aria-label='Search')
      //-   button.btn.btn-outline-success.my-2.my-sm-0(type='submit') Search
      ul.navbar-nav(v-if="isLoggedIn")
        li.nav-item
          a.nav-link(href='/logout') Logout

</template>

<script>
  import { mapState } from 'vuex'

  export default {
    computed: mapState({
      isLoggedIn: state => state.isLoggedIn
    })
  }
</script>