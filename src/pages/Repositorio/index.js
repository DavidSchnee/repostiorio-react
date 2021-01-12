import React, {useState, useEffect} from 'react'
import Select from 'react-select'
import {Container, Owner, Loading, BackButton, IssueList, PageActions, WrapperButtons, SubmitFilter, FormFilter} from './styles'
import { FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api'

export default function Repositorio({match}){


  const [repositorio, setRepositorio] = useState({})
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState({state: 'open', per_page: 5 })

  useEffect(() => {
    async function load(){
      const nomeRepo = decodeURIComponent(match.params.repositorio)

      const [repositorioData, issueData] = await Promise.all([
        api.get(`repos/${nomeRepo}`),
        api.get(`repos/${nomeRepo}/issues`, {
          params: {
            state: 'open', 
            per_page: 5
          }
        })
      ]);

      setRepositorio(repositorioData.data)
      setIssues(issueData.data)
      setLoading(false)
    }

    load()

  }, [match.params.repositorio])
  
  useEffect(() => {
    async function loadIssue(){

      const nomeRepo = decodeURIComponent(match.params.repositorio)
      const reponse = await api.get(`/repos/${nomeRepo}/issues`, {
        params: {
          state: filter.state,
          page,
          per_page: filter.per_page
        }
      })

      setIssues(reponse.data)
    }

    loadIssue()

  }, [page, filter])

  function handlePage(action){
    setPage(action === 'back' ? page - 1 : page + 1 )
  }
  
  const handleFilerState = e => {
    setFilter({...filter, state: e.value})
  }

  const handleFilerPerPage = e => {
    setFilter({...filter, per_page: e.value})
  }

  const optionsFilterState = [
    { value: 'all', label: 'Todos' },
    { value: 'open', label: 'Abertos'},
    { value: 'closed', label: 'Fechados'}
  ]

  const optionsFilterPerPage = [
    { value: 5, label: 5 },
    { value: 10, label: 10},
    { value: 15, label: 15 },
    { value: 20, label: 20 }
  ]


  if(loading) {
    return (
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    )
  }
  return(
    <Container>
      <BackButton to="/">
        <FaArrowLeft color="#000" size={30}/>
      </BackButton>
      <Owner>
        <img src={repositorio.owner.avatar_url} alt={repositorio.owner.login} />
        <h1>{repositorio.name}</h1>
        <p>{repositorio.description}</p>
      </Owner>
      <FormFilter>
        <WrapperButtons>
          <Select defaultValue={{ value: filter.state, label: 'Todos' }} onChange={handleFilerState} options={optionsFilterState} />
          <Select defaultValue={{ value: filter.per_page, label: filter.per_page }} onChange={handleFilerPerPage} options={optionsFilterPerPage} />
        </WrapperButtons>
      </FormFilter>

      <IssueList>
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />

            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map(label => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>

              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssueList>

      <PageActions>
        <button type="button" onClick={() => handlePage('back') } disabled={page < 2} >Voltar</button>
        <button type="button" onClick={() => handlePage('next') }>Proxima</button>
      </PageActions>

    </Container>
  )
}